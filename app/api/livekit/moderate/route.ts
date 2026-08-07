import { RoomServiceClient, TokenVerifier } from "livekit-server-sdk"
import { NextRequest, NextResponse } from "next/server"
import { markSpaceEnded, type EndedSpaceParticipant } from "@/lib/ended-spaces"

function getRoomService() {
  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL

  if (!apiKey || !apiSecret || !wsUrl) {
    throw new Error("LiveKit credentials missing")
  }
  return new RoomServiceClient(wsUrl, apiKey, apiSecret)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { roomName, targetIdentity, action, token } = body

  if (!roomName || !action || !token) {
    return NextResponse.json(
      { error: { message: "Missing parameters" } },
      { status: 400 }
    )
  }

  const cleanRoom = roomName.trim().substring(0, 30)

  let identity = ""
  try {
    const verifier = new TokenVerifier(
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!
    )
    const claims = await verifier.verify(token)
    identity = claims.sub || ""
    if (!identity) throw new Error("Invalid token identity")

    const tokenRoom = claims.video?.room
    if (tokenRoom && tokenRoom !== cleanRoom) {
      return NextResponse.json(
        { error: { message: "Token does not match this space" } },
        { status: 403 }
      )
    }
  } catch (e: any) {
    return NextResponse.json(
      { error: { message: "Invalid or expired token" } },
      { status: 401 }
    )
  }

  let roomService: RoomServiceClient
  try {
    roomService = getRoomService()
  } catch (e: any) {
    return NextResponse.json({ error: { message: e.message } }, { status: 500 })
  }

  let isHost = false
  let isCohost = false
  let targetRoom: any = null
  let meta: any = null

  try {
    const rooms = await roomService.listRooms([cleanRoom])
    targetRoom = rooms.length > 0 ? rooms[0] : null
    if (targetRoom && targetRoom.metadata) {
      meta = JSON.parse(targetRoom.metadata)
      if (meta.host === identity) {
        isHost = true
      }
      if (meta.cohosts && meta.cohosts.includes(identity)) {
        isCohost = true
      }
    }
  } catch {}

  if (!isHost && !isCohost) {
    return NextResponse.json(
      {
        error: { message: "Only the host or co-host can perform this action" },
      },
      { status: 403 }
    )
  }

  if (
    (action === "grant_cohost" || action === "revoke_cohost" || action === "end") &&
    !isHost
  ) {
    const actionLabel = action === "end" ? "end the space" : "manage co-hosts"
    return NextResponse.json(
      { error: { message: `Only the main host can ${actionLabel}` } },
      { status: 403 }
    )
  }

  if (targetIdentity && meta && targetIdentity === meta.host) {
    return NextResponse.json(
      { error: { message: "Cannot perform moderation actions on the host" } },
      { status: 403 }
    )
  }

  if (
    targetIdentity &&
    meta &&
    meta.cohosts?.includes(targetIdentity) &&
    !isHost
  ) {
    return NextResponse.json(
      { error: { message: "Co-hosts cannot moderate other co-hosts" } },
      { status: 403 }
    )
  }

  switch (action) {
    case "grant_cohost":
      if (!targetIdentity) {
        return NextResponse.json(
          { error: { message: "Missing targetIdentity" } },
          { status: 400 }
        )
      }
      if (!meta.cohosts) meta.cohosts = []
      if (meta.cohosts.length >= 2 && !meta.cohosts.includes(targetIdentity)) {
        return NextResponse.json(
          { error: { message: "Maximum 2 co-hosts allowed" } },
          { status: 400 }
        )
      }
      if (!meta.cohosts.includes(targetIdentity)) {
        meta.cohosts.push(targetIdentity)
        await roomService.updateRoomMetadata(cleanRoom, JSON.stringify(meta))
      }
      return NextResponse.json({ data: { success: true } })

    case "revoke_cohost":
      if (!targetIdentity) {
        return NextResponse.json(
          { error: { message: "Missing targetIdentity" } },
          { status: 400 }
        )
      }
      if (meta.cohosts && meta.cohosts.includes(targetIdentity)) {
        meta.cohosts = meta.cohosts.filter(
          (id: string) => id !== targetIdentity
        )
        await roomService.updateRoomMetadata(cleanRoom, JSON.stringify(meta))
      }
      return NextResponse.json({ data: { success: true } })

    case "end":
      {
        let host = "Unknown"
        let cohosts: string[] = []
        let participants: any[] = []
        try {
          participants = await roomService.listParticipants(cleanRoom)
        } catch {}
        try {
          if (meta?.host) host = meta.host
          if (Array.isArray(meta?.cohosts)) cohosts = meta.cohosts
        } catch {}

        const speakers: EndedSpaceParticipant[] = participants
          .map((p: any) => {
            let avatar = p.identity
            try {
              if (p.metadata) {
                const m = JSON.parse(p.metadata)
                if (m.avatar) avatar = m.avatar
              }
            } catch {}
            return { identity: p.identity, avatar }
          })
          .filter(
            (p: any, i: number, arr: any[]) =>
              arr.findIndex((x) => x.identity === p.identity) === i
          )

        markSpaceEnded(cleanRoom.toLowerCase().trim(), {
          host,
          cohosts,
          speakers,
        })

        // Disconnect everyone by deleting the room...
        await roomService.deleteRoom(cleanRoom)

        // ...then re-create it as a durable "ended" tombstone so the name stays
        // reserved and the join route can never fall through to "create + host".
        // Roster lives in metadata (shared LiveKit state), not the server disk.
        try {
          await roomService.createRoom({
            name: cleanRoom,
            emptyTimeout: 86400,
            maxParticipants: 0,
            metadata: JSON.stringify({
              ended: true,
              endedAt: Date.now(),
              host,
              cohosts,
              speakers: participants.map((p) => p.identity),
            }),
          })
        } catch {}
      }
      return NextResponse.json({ data: { success: true } })

    case "kick":
      if (!targetIdentity) {
        return NextResponse.json(
          { error: { message: "Missing targetIdentity" } },
          { status: 400 }
        )
      }
      if (meta) {
        try {
          const banned = meta.banned || []
          if (!banned.includes(targetIdentity)) {
            banned.push(targetIdentity)
            meta.banned = banned
            await roomService.updateRoomMetadata(
              cleanRoom,
              JSON.stringify(meta)
            )
          }
        } catch {}
      }
      try {
        await roomService.removeParticipant(cleanRoom, targetIdentity)
      } catch (e: any) {
        return NextResponse.json(
          { error: { message: e.message } },
          { status: 500 }
        )
      }
      return NextResponse.json({ data: { success: true } })

    case "grant_mic":
      if (!targetIdentity) {
        return NextResponse.json(
          { error: { message: "Missing targetIdentity" } },
          { status: 400 }
        )
      }
      try {
        const participant = await roomService.getParticipant(
          cleanRoom,
          targetIdentity
        )
        await roomService.updateParticipant(cleanRoom, targetIdentity, {
          metadata: participant.metadata,
          permission: {
            canPublish: true,
            canSubscribe: participant.permission?.canSubscribe ?? true,
            canPublishData: participant.permission?.canPublishData ?? true,
            canUpdateMetadata:
              participant.permission?.canUpdateMetadata ?? false,
            hidden: participant.permission?.hidden ?? false,
            recorder: participant.permission?.recorder ?? false,
          },
        })
      } catch (e: any) {
        return NextResponse.json(
          { error: { message: e.message } },
          { status: 500 }
        )
      }
      return NextResponse.json({ data: { success: true } })

    case "revoke_mic":
      if (!targetIdentity) {
        return NextResponse.json(
          { error: { message: "Missing targetIdentity" } },
          { status: 400 }
        )
      }
      try {
        const participant = await roomService.getParticipant(
          cleanRoom,
          targetIdentity
        )
        await roomService.updateParticipant(cleanRoom, targetIdentity, {
          metadata: participant.metadata,
          permission: {
            canPublish: false,
            canSubscribe: participant.permission?.canSubscribe ?? true,
            canPublishData: participant.permission?.canPublishData ?? true,
            canUpdateMetadata:
              participant.permission?.canUpdateMetadata ?? false,
            hidden: participant.permission?.hidden ?? false,
            recorder: participant.permission?.recorder ?? false,
          },
        })
      } catch (e: any) {
        return NextResponse.json(
          { error: { message: e.message } },
          { status: 500 }
        )
      }
      return NextResponse.json({ data: { success: true } })

    case "mute":
      if (!targetIdentity) {
        return NextResponse.json(
          { error: { message: "Missing targetIdentity" } },
          { status: 400 }
        )
      }
      try {
        const participant = await roomService.getParticipant(
          cleanRoom,
          targetIdentity
        )
        for (const track of participant.tracks) {
          if (track.source === 2) {
            await roomService.mutePublishedTrack(
              cleanRoom,
              targetIdentity,
              track.sid,
              true
            )
          }
        }
      } catch (e: any) {
        return NextResponse.json(
          { error: { message: e.message } },
          { status: 500 }
        )
      }
      return NextResponse.json({ data: { success: true } })

    default:
      return NextResponse.json(
        { error: { message: "Invalid action" } },
        { status: 400 }
      )
  }
}
