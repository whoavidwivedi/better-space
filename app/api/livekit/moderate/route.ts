import {
  DataPacket_Kind,
  RoomServiceClient,
  TokenVerifier,
} from "livekit-server-sdk"
import { NextRequest, NextResponse } from "next/server"
import { markSpaceEnded, type EndedSpaceParticipant } from "@/lib/ended-spaces"
import {
  decryptCohostSecrets,
  encryptCohostSecrets,
  hasCohostAccess,
  hasHostAccess,
  roleCookieName,
} from "@/lib/space-auth"
import { canPerformModerationAction } from "@/lib/moderation-auth"

function getRoomService() {
  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL

  if (!apiKey || !apiSecret || !wsUrl) {
    throw new Error("LiveKit credentials missing")
  }
  return new RoomServiceClient(wsUrl, apiKey, apiSecret)
}

async function syncParticipantPublishPermission(
  roomService: RoomServiceClient,
  roomName: string,
  identity: string,
  canPublish: boolean
) {
  const participants = await roomService.listParticipants(roomName)
  if (!participants.some((participant) => participant.identity === identity)) {
    return
  }

  const participant = await roomService.getParticipant(roomName, identity)
  await roomService.updateParticipant(roomName, identity, {
    metadata: participant.metadata,
    permission: {
      canPublish,
      canSubscribe: participant.permission?.canSubscribe ?? true,
      canPublishData: participant.permission?.canPublishData ?? true,
      canUpdateMetadata: participant.permission?.canUpdateMetadata ?? false,
      hidden: participant.permission?.hidden ?? false,
      recorder: participant.permission?.recorder ?? false,
    },
  })
}

export async function POST(req: NextRequest) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: { message: "Invalid JSON body" } },
      { status: 400 }
    )
  }

  const { roomName, targetIdentity, action, token } = body
  const origin = req.headers.get("origin")
  if (origin && origin !== new URL(req.url).origin) {
    return NextResponse.json(
      { error: { message: "Cross-origin requests are not allowed" } },
      { status: 403 }
    )
  }

  if (
    typeof roomName !== "string" ||
    typeof action !== "string" ||
    typeof token !== "string"
  ) {
    return NextResponse.json(
      { error: { message: "Missing parameters" } },
      { status: 400 }
    )
  }

  const cleanRoom = roomName.trim()
  if (!/^[a-zA-Z0-9_-]+$/.test(cleanRoom) || cleanRoom.length > 30) {
    return NextResponse.json(
      { error: { message: "Invalid room name" } },
      { status: 400 }
    )
  }

  const roleSecret = req.cookies.get(roleCookieName(cleanRoom))?.value ?? ""

  let identity = ""
  try {
    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET
    if (!apiKey || !apiSecret) throw new Error("Missing LiveKit credentials")

    const verifier = new TokenVerifier(apiKey, apiSecret)
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
  } catch {
    return NextResponse.json(
      { error: { message: "Invalid or expired token" } },
      { status: 401 }
    )
  }

  let roomService: RoomServiceClient
  try {
    roomService = getRoomService()
  } catch {
    return NextResponse.json(
      { error: { message: "Unable to reach the realtime service" } },
      { status: 500 }
    )
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
      isHost = hasHostAccess(meta, identity, roleSecret)
      isCohost = hasCohostAccess(meta, identity, roleSecret)
    }
  } catch {
    return NextResponse.json(
      { error: { message: "Unable to authorize this action" } },
      { status: 503 }
    )
  }

  if (!isHost && !isCohost) {
    return NextResponse.json(
      { error: { message: "Only the host or co-host can perform this action" } },
      { status: 403 }
    )
  }

  if (!canPerformModerationAction(action, isHost, isCohost)) {
    return NextResponse.json(
      { error: { message: "Only the main host can manage co-hosts" } },
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
    Array.isArray(meta.cohosts) &&
    meta.cohosts.includes(targetIdentity) &&
    !isHost
  ) {
    return NextResponse.json(
      { error: { message: "Co-hosts cannot moderate other co-hosts" } },
      { status: 403 }
    )
  }

  switch (action) {
    case "grant_cohost": {
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
      }
      const cohostSecrets = decryptCohostSecrets(meta.cohostSecretsEncrypted)
      const cohostSecret = cohostSecrets[targetIdentity] || crypto.randomUUID()
      cohostSecrets[targetIdentity] = cohostSecret
      meta.cohostSecretsEncrypted = encryptCohostSecrets(cohostSecrets)
      delete meta.cohostSecrets
      await roomService.updateRoomMetadata(cleanRoom, JSON.stringify(meta))
      await syncParticipantPublishPermission(roomService, cleanRoom, targetIdentity, true)
      await roomService.sendData(
        cleanRoom,
        new TextEncoder().encode(
          JSON.stringify({
            type: "COHOST_CREDENTIALS",
            identity: targetIdentity,
            secret: cohostSecret,
          })
        ),
        DataPacket_Kind.RELIABLE,
        { destinationIdentities: [targetIdentity] }
      )
      return NextResponse.json({ data: { success: true } })
    }

    case "revoke_cohost": {
      if (!targetIdentity) {
        return NextResponse.json(
          { error: { message: "Missing targetIdentity" } },
          { status: 400 }
        )
      }
      if (Array.isArray(meta.cohosts)) {
        meta.cohosts = meta.cohosts.filter((id: string) => id !== targetIdentity)
      }
      const updatedCohostSecrets = decryptCohostSecrets(meta.cohostSecretsEncrypted)
      delete updatedCohostSecrets[targetIdentity]
      meta.cohostSecretsEncrypted = encryptCohostSecrets(updatedCohostSecrets)
      delete meta.cohostSecrets
      await roomService.updateRoomMetadata(cleanRoom, JSON.stringify(meta))
      await syncParticipantPublishPermission(roomService, cleanRoom, targetIdentity, false)
      return NextResponse.json({ data: { success: true } })
    }

    case "end": {
      let host = "Unknown"
      let cohosts: string[] = []
      let participants: any[] = []
      try {
        participants = await roomService.listParticipants(cleanRoom)
      } catch {}
      if (meta?.host) host = meta.host
      if (Array.isArray(meta?.cohosts)) cohosts = meta.cohosts

      const speakers: EndedSpaceParticipant[] = participants
        .map((p: any) => {
          let avatar = p.identity
          try {
            if (p.metadata) {
              const participantMeta = JSON.parse(p.metadata)
              if (participantMeta.avatar) avatar = participantMeta.avatar
            }
          } catch {}
          return { identity: p.identity, avatar }
        })
        .filter(
          (p: any, i: number, arr: any[]) =>
            arr.findIndex((x) => x.identity === p.identity) === i
        )

      markSpaceEnded(cleanRoom.toLowerCase().trim(), { host, cohosts, speakers })
      await roomService.deleteRoom(cleanRoom)

      try {
        await roomService.createRoom({
          name: cleanRoom,
          emptyTimeout: 31536000,
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
      return NextResponse.json({ data: { success: true } })
    }

    case "kick": {
      if (!targetIdentity) return NextResponse.json({ error: { message: "Missing targetIdentity" } }, { status: 400 })
      if (meta) {
        const banned = Array.isArray(meta.banned) ? meta.banned : []
        if (!banned.includes(targetIdentity)) banned.push(targetIdentity)
        meta.banned = banned
        await roomService.updateRoomMetadata(cleanRoom, JSON.stringify(meta))
      }
      try {
        await roomService.removeParticipant(cleanRoom, targetIdentity)
      } catch {
        return NextResponse.json({ error: { message: "Unable to remove participant" } }, { status: 500 })
      }
      return NextResponse.json({ data: { success: true } })
    }

    case "grant_mic":
    case "revoke_mic": {
      if (!targetIdentity) return NextResponse.json({ error: { message: "Missing targetIdentity" } }, { status: 400 })
      try {
        const participant = await roomService.getParticipant(cleanRoom, targetIdentity)
        await roomService.updateParticipant(cleanRoom, targetIdentity, {
          metadata: participant.metadata,
          permission: {
            canPublish: action === "grant_mic",
            canSubscribe: participant.permission?.canSubscribe ?? true,
            canPublishData: participant.permission?.canPublishData ?? true,
            canUpdateMetadata: participant.permission?.canUpdateMetadata ?? false,
            hidden: participant.permission?.hidden ?? false,
            recorder: participant.permission?.recorder ?? false,
          },
        })
      } catch {
        return NextResponse.json({ error: { message: "Unable to update microphone permission" } }, { status: 500 })
      }
      return NextResponse.json({ data: { success: true } })
    }

    case "mute": {
      if (!targetIdentity) return NextResponse.json({ error: { message: "Missing targetIdentity" } }, { status: 400 })
      try {
        const participant = await roomService.getParticipant(cleanRoom, targetIdentity)
        for (const track of participant.tracks) {
          if (track.source === 2) {
            await roomService.mutePublishedTrack(cleanRoom, targetIdentity, track.sid, true)
          }
        }
      } catch {
        return NextResponse.json({ error: { message: "Unable to mute participant" } }, { status: 500 })
      }
      return NextResponse.json({ data: { success: true } })
    }

    default:
      return NextResponse.json({ error: { message: "Invalid action" } }, { status: 400 })
  }
}
