import { AccessToken, RoomServiceClient } from "livekit-server-sdk"
import { NextRequest, NextResponse } from "next/server"
import {
  addRecentSpace,
  getKnownRoom,
  getRecentSpaces,
  recordKnownRoom,
} from "@/lib/recent-spaces"

function getRoomService() {
  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL

  if (!apiKey || !apiSecret || !wsUrl) {
    throw new Error("LiveKit credentials missing")
  }
  return new RoomServiceClient(wsUrl, apiKey, apiSecret)
}

export async function GET() {
  let roomService: RoomServiceClient
  try {
    roomService = getRoomService()
  } catch (e: any) {
    return NextResponse.json({ error: { message: e.message } }, { status: 500 })
  }

  const rooms = await roomService.listRooms()

  const roomDetails = await Promise.all(
    rooms.map(async (r) => {
      let participants: any[] = []
      try {
        participants = await roomService.listParticipants(r.name)
      } catch {}

      let host = "Unknown"
      let hostAvatar = "Felix"
      let title = r.name
      try {
        if (r.metadata) {
          const meta = JSON.parse(r.metadata)
          if (meta.host) host = meta.host
          if (meta.hostAvatar) hostAvatar = meta.hostAvatar
          if (meta.title) title = meta.title
        }
      } catch {}

      if (host === "Unknown" && participants.length > 0) {
        host = participants[0].identity
      }

      const participantDetails = participants.map((p) => {
        let avatar = p.identity || "Felix"
        if (p.metadata) {
          try {
            const pm = JSON.parse(p.metadata)
            if (pm.avatar) avatar = pm.avatar
          } catch {}
        }
        return { identity: p.identity, avatar }
      })

      const participantNames = participantDetails.map((p) => p.identity)

      // Record room state for recent spaces archiving if it ends
      recordKnownRoom(r.name, {
        host,
        displayName: title,
        participants: participantNames,
        numParticipants: r.numParticipants,
      })

      return {
        name: r.name,
        displayName: title,
        numParticipants: r.numParticipants,
        host,
        hostAvatar,
        participants: participantDetails.slice(0, 5),
      }
    })
  )

  return NextResponse.json({ data: roomDetails, recent: getRecentSpaces() })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { roomName, hostName, avatar } = body

  if (!roomName || !hostName) {
    return NextResponse.json(
      { error: { message: "Missing roomName or hostName" } },
      { status: 400 }
    )
  }

  const cleanTitle = roomName.trim().substring(0, 40)
  const cleanHost = hostName.trim().substring(0, 30)
  const cleanAvatar = (avatar || "Felix").trim().substring(0, 50)

  let roomService: RoomServiceClient
  try {
    roomService = getRoomService()
  } catch (e: any) {
    return NextResponse.json({ error: { message: e.message } }, { status: 500 })
  }

  const hostSecret = crypto.randomUUID()

  try {
    const allRooms = await roomService.listRooms()
    if (allRooms.length >= 5) {
      return NextResponse.json(
        {
          error: {
            message:
              "Server is at capacity (max 5 active spaces). Please try again later.",
          },
        },
        { status: 429 }
      )
    }

    for (const r of allRooms) {
      if (r.metadata) {
        try {
          const meta = JSON.parse(r.metadata)
          if (meta.host === cleanHost) {
            return NextResponse.json(
              {
                error: {
                  message: `You are already hosting the space "${meta.title || r.name}". You can only host one space at a time.`,
                },
              },
              { status: 403 }
            )
          }
        } catch {}
      }
    }
  } catch {}

  // Generate unique room slug with unique short suffix so spaces with identical titles never collide
  const baseSlug =
    cleanTitle
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "space"

  const shortSuffix = Math.random().toString(36).substring(2, 6)
  const uniqueRoomName = `${baseSlug}-${shortSuffix}`.substring(0, 50)

  await roomService.createRoom({
    name: uniqueRoomName,
    emptyTimeout: 43200,
    maxParticipants: 50,
    metadata: JSON.stringify({
      title: cleanTitle,
      host: cleanHost,
      hostAvatar: cleanAvatar,
      hostSecret,
      banned: [],
      cohosts: [],
    }),
  })

  recordKnownRoom(uniqueRoomName, {
    host: cleanHost,
    displayName: cleanTitle,
    participants: [cleanHost],
    numParticipants: 1,
  })

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    {
      identity: cleanHost,
      metadata: JSON.stringify({ avatar: cleanAvatar }),
    }
  )
  at.metadata = JSON.stringify({ avatar: cleanAvatar })
  at.addGrant({
    room: uniqueRoomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    canUpdateOwnMetadata: true,
  })

  const token = await at.toJwt()
  return NextResponse.json({
    data: {
      roomName: uniqueRoomName,
      displayName: cleanTitle,
      token,
      hostSecret,
    },
  })
}
