import { AccessToken, RoomServiceClient } from "livekit-server-sdk"
import { NextRequest, NextResponse } from "next/server"
import { isSpaceEnded } from "@/lib/ended-spaces"

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

  const rooms = (await roomService.listRooms()).filter((r) => {
    if (isSpaceEnded(r.name)) return false
    if (r.metadata) {
      try {
        const meta = JSON.parse(r.metadata)
        if (meta.ended) return false
      } catch {}
    }
    return true
  })
  const roomDetails = await Promise.all(
    rooms.map(async (r) => {
      let participants: any[] = []
      try {
        participants = await roomService.listParticipants(r.name)
      } catch {}

      let host = "Unknown"
      try {
        if (r.metadata) {
          const meta = JSON.parse(r.metadata)
          if (meta.host) host = meta.host
        }
      } catch {}

      if (host === "Unknown" && participants.length > 0) {
        host = participants[0].identity
      }

      return {
        name: r.name,
        numParticipants: r.numParticipants,
        host,
        participants: participants
          .map((p) => {
            let avatar = p.identity
            try {
              if (p.metadata) {
                const meta = JSON.parse(p.metadata)
                if (meta.avatar) avatar = meta.avatar
              }
            } catch {}
            return { identity: p.identity, avatar }
          })
          .slice(0, 3),
      }
    })
  )

  return NextResponse.json({ data: roomDetails })
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

  const cleanRoom = roomName.trim().substring(0, 30)
  const cleanHost = hostName.trim().substring(0, 30)

  if (isSpaceEnded(cleanRoom)) {
    return NextResponse.json(
      { ended: true, error: "Space has ended" },
      { status: 410 }
    )
  }

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
                  message: `You are already hosting the space "${r.name}". You can only host one space at a time.`,
                },
              },
              { status: 403 }
            )
          }
        } catch {}
      }
    }

    const existingRooms = allRooms.filter((r) => r.name === cleanRoom)
    if (existingRooms.length > 0) {
      return NextResponse.json(
        {
          error: {
            message:
              "Space already exists. Please join it from the lobby instead.",
          },
        },
        { status: 400 }
      )
    }
  } catch {}

  await roomService.createRoom({
    name: cleanRoom,
    emptyTimeout: 43200,
    maxParticipants: 50,
    metadata: JSON.stringify({
      host: cleanHost,
      hostSecret,
      banned: [],
      cohosts: [],
    }),
  })

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    {
      identity: cleanHost,
      metadata: JSON.stringify({ avatar: avatar?.trim() || cleanHost }),
    }
  )
  at.addGrant({
    room: cleanRoom,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    canUpdateOwnMetadata: true,
  })

  const token = await at.toJwt()
  return NextResponse.json({ data: { roomName: cleanRoom, token, hostSecret } })
}
