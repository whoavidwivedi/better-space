import { AccessToken, RoomServiceClient } from "livekit-server-sdk"
import { NextRequest, NextResponse } from "next/server"
import { getEndedSpace, isSpaceEnded } from "@/lib/ended-spaces"

function getRoomService() {
  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL

  if (!apiKey || !apiSecret || !wsUrl) {
    throw new Error("LiveKit credentials missing")
  }
  return new RoomServiceClient(wsUrl, apiKey, apiSecret)
}

export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get("room")
  const usernameQuery = req.nextUrl.searchParams.get("username")
  const hostSecretQuery = req.nextUrl.searchParams.get("hostSecret")
  const avatarQuery = req.nextUrl.searchParams.get("avatar")

  if (!room) {
    return NextResponse.json(
      { error: { message: "Missing room" } },
      { status: 400 }
    )
  }

  const cleanRoom = room.trim().substring(0, 30)
  const hostSecret = hostSecretQuery?.trim() ?? ""
  const avatar = avatarQuery?.trim() ?? ""

  if (!/^[a-zA-Z0-9_-]+$/.test(cleanRoom)) {
    return NextResponse.json(
      { error: { message: "Invalid room name" } },
      { status: 400 }
    )
  }

  if (isSpaceEnded(cleanRoom)) {
    const ended = getEndedSpace(cleanRoom)
    return NextResponse.json(
      {
        ended: true,
        error: "Space has ended",
        space: ended,
        data: { ended: true, endedInfo: ended },
      },
      { status: 410 }
    )
  }

  if (!usernameQuery) {
    return NextResponse.json(
      { error: { message: "Missing username" } },
      { status: 400 }
    )
  }

  const username = usernameQuery.trim().substring(0, 30)

  let roomService: RoomServiceClient
  try {
    roomService = getRoomService()
  } catch (e: any) {
    return NextResponse.json({ error: { message: e.message } }, { status: 500 })
  }

  const getRoomMeta = async () => {
    for (let i = 0; i < 3; i++) {
      try {
        const rooms = await roomService.listRooms([cleanRoom])
        if (rooms.length > 0) return rooms[0]
      } catch {}
      await new Promise((r) => setTimeout(r, 500))
    }
    return null
  }

  const targetRoom = await getRoomMeta()

  let isHost = false
  let isCohost = false
  let activeHostSecret = hostSecret

  if (targetRoom) {
    if (targetRoom.metadata) {
      try {
        const meta = JSON.parse(targetRoom.metadata)
        if (meta.ended) {
          const endedData = {
            name: cleanRoom,
            endedAt: meta.endedAt ?? Date.now(),
            host: meta.host || "Unknown",
            cohosts: Array.isArray(meta.cohosts) ? meta.cohosts : [],
            speakers: Array.isArray(meta.speakers)
              ? meta.speakers.map((id: string) => ({ identity: id }))
              : [],
          }
          return NextResponse.json(
            {
              ended: true,
              error: "Space has ended",
              space: endedData,
              data: {
                ended: true,
                endedInfo: endedData,
              },
            },
            { status: 410 }
          )
        }
        if (meta.banned && meta.banned.includes(username)) {
          return NextResponse.json(
            { error: { message: "You have been kicked from this space" } },
            { status: 403 }
          )
        }
        if (meta.host === username) {
          if (meta.hostSecret && hostSecret === meta.hostSecret) {
            isHost = true
            activeHostSecret = meta.hostSecret
          } else if (!meta.hostSecret) {
            isHost = true
            activeHostSecret = hostSecret || crypto.randomUUID()
            meta.hostSecret = activeHostSecret
            await roomService.updateRoomMetadata(
              cleanRoom,
              JSON.stringify(meta)
            )
          } else {
            // Check if active host is already connected in room
            let isHostConnected = false
            try {
              const participants = await roomService.listParticipants(cleanRoom)
              isHostConnected = participants.some(
                (p) => p.identity === username
              )
            } catch {}

            if (isHostConnected) {
              return NextResponse.json(
                { error: { message: "Username already active in this space" } },
                { status: 403 }
              )
            } else {
              // Host was disconnected or rejoining from another tab; reclaim host status
              isHost = true
              activeHostSecret = meta.hostSecret
            }
          }
        } else if (!meta.host || meta.host === "Unknown") {
          // Room exists but has no designated host - assign this user as host
          isHost = true
          activeHostSecret = hostSecret || crypto.randomUUID()
          meta.host = username
          meta.hostSecret = activeHostSecret
          await roomService.updateRoomMetadata(cleanRoom, JSON.stringify(meta))
        }

        if (Array.isArray(meta.cohosts) && meta.cohosts.includes(username)) {
          isCohost = true
        }
      } catch {}
    } else {
      // Room exists on LiveKit but has no metadata - initialize it with this user as host
      isHost = true
      activeHostSecret = hostSecret || crypto.randomUUID()
      try {
        const meta = {
          host: username,
          hostSecret: activeHostSecret,
          banned: [],
          cohosts: [],
        }
        await roomService.updateRoomMetadata(cleanRoom, JSON.stringify(meta))
      } catch {}
    }
  } else {
    // Room does NOT exist yet: This user is creating the space!
    // Initialize room on LiveKit and grant full Host publishing permissions
    isHost = true
    activeHostSecret = hostSecret || crypto.randomUUID()
    try {
      const meta = {
        host: username,
        hostSecret: activeHostSecret,
        banned: [],
        cohosts: [],
      }
      await roomService.createRoom({
        name: cleanRoom,
        emptyTimeout: 43200,
        maxParticipants: 50,
        metadata: JSON.stringify(meta),
      })
    } catch {}
  }

  if (targetRoom && targetRoom.numParticipants >= 50 && !isHost) {
    return NextResponse.json(
      { error: { message: "This space is full (max 50 participants)." } },
      { status: 403 }
    )
  }

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    {
      identity: username,
      metadata: JSON.stringify({ avatar }),
    }
  )
  at.addGrant({
    room: cleanRoom,
    roomJoin: true,
    canPublish: isHost || isCohost,
    canSubscribe: true,
    canPublishData: true,
    canUpdateOwnMetadata: true,
  })

  const token = await at.toJwt()
  return NextResponse.json({
    data: {
      token,
      hostSecret: isHost ? activeHostSecret : undefined,
      isHost,
      isCohost,
      roomName: cleanRoom,
    },
  })
}
