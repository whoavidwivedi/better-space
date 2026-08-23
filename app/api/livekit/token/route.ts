import { AccessToken, RoomServiceClient } from "livekit-server-sdk"
import { NextRequest, NextResponse } from "next/server"
import { getEndedSpace, isSpaceEnded } from "@/lib/ended-spaces"
import {
  encryptSpaceSecret,
  hasCohostAccess,
  hasHostAccess,
  roleCookieName,
} from "@/lib/space-auth"

const ROOM_PATTERN = /^[a-zA-Z0-9_-]+$/
const MAX_ROOM_LENGTH = 30
const MAX_USERNAME_LENGTH = 30
const MAX_AVATAR_LENGTH = 200

function getRoomService() {
  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL

  if (!apiKey || !apiSecret || !wsUrl) throw new Error("LiveKit credentials missing")
  return new RoomServiceClient(wsUrl, apiKey, apiSecret)
}

function badRequest(message: string) {
  return NextResponse.json({ error: { message } }, { status: 400 })
}

function serverError() {
  return NextResponse.json(
    { error: { message: "Unable to issue a room token" } },
    { status: 500 }
  )
}

export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get("room")?.trim() ?? ""
  const usernameQuery = req.nextUrl.searchParams.get("username")?.trim() ?? ""
  const avatar = req.nextUrl.searchParams.get("avatar")?.trim() ?? ""
  const hostSecret = req.headers.get("x-host-secret")?.trim() ?? ""
  const cohostSecret = req.headers.get("x-cohost-secret")?.trim() ?? ""

  const origin = req.headers.get("origin")
  if (origin && origin !== new URL(req.url).origin) {
    return NextResponse.json(
      { error: { message: "Cross-origin requests are not allowed" } },
      { status: 403 }
    )
  }

  if (!room) return badRequest("Missing room")
  if (room.length > MAX_ROOM_LENGTH || !ROOM_PATTERN.test(room)) {
    return badRequest("Invalid room name")
  }
  if (!usernameQuery) return badRequest("Missing username")
  if (usernameQuery.length > MAX_USERNAME_LENGTH) {
    return badRequest("Username is too long")
  }
  if (avatar.length > MAX_AVATAR_LENGTH) return badRequest("Avatar is too long")

  const cleanRoom = room
  const username = usernameQuery
  const savedRoleSecret = req.cookies.get(roleCookieName(cleanRoom))?.value ?? ""
  const suppliedHostSecret = hostSecret || savedRoleSecret
  const suppliedCohostSecret = cohostSecret || savedRoleSecret

  if (isSpaceEnded(cleanRoom)) {
    const ended = getEndedSpace(cleanRoom)
    return NextResponse.json(
      { ended: true, error: "Space has ended", space: ended, data: { ended: true, endedInfo: ended } },
      { status: 410 }
    )
  }

  let roomService: RoomServiceClient
  try {
    roomService = getRoomService()
  } catch {
    return serverError()
  }

  const getRoomMeta = async () => {
    for (let i = 0; i < 3; i++) {
      try {
        const rooms = await roomService.listRooms([cleanRoom])
        if (rooms.length > 0) return rooms[0]
      } catch {
        // Retry transient LiveKit list failures before treating the room as absent.
      }
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
    return null
  }

  let targetRoom = await getRoomMeta()
  let isHost = false
  let isCohost = false
  let activeHostSecret = hostSecret

  if (targetRoom) {
    if (targetRoom.metadata) {
      let meta: any
      try {
        meta = JSON.parse(targetRoom.metadata)
      } catch {
        return NextResponse.json({ error: { message: "Space metadata is invalid" } }, { status: 503 })
      }

      if (meta.ended) {
        const endedData = {
          name: cleanRoom,
          endedAt: meta.endedAt ?? Date.now(),
          host: meta.host || "Unknown",
          cohosts: Array.isArray(meta.cohosts) ? meta.cohosts : [],
          speakers: Array.isArray(meta.speakers) ? meta.speakers.map((id: string) => ({ identity: id })) : [],
        }
        return NextResponse.json(
          { ended: true, error: "Space has ended", space: endedData, data: { ended: true, endedInfo: endedData } },
          { status: 410 }
        )
      }

      if (Array.isArray(meta.banned) && meta.banned.includes(username)) {
        return NextResponse.json({ error: { message: "You have been kicked from this space" } }, { status: 403 })
      }

      if (meta.host === username) {
        if (hasHostAccess(meta, username, suppliedHostSecret)) {
          isHost = true
          activeHostSecret = suppliedHostSecret
          if (meta.hostSecret && !meta.hostSecretEncrypted) {
            meta.hostSecretEncrypted = encryptSpaceSecret(suppliedHostSecret)
            delete meta.hostSecret
            await roomService.updateRoomMetadata(cleanRoom, JSON.stringify(meta))
          }
        } else if (!meta.hostSecret && !meta.hostSecretEncrypted) {
          isHost = true
          activeHostSecret = suppliedHostSecret || crypto.randomUUID()
          meta.hostSecretEncrypted = encryptSpaceSecret(activeHostSecret)
          delete meta.hostSecret
          await roomService.updateRoomMetadata(cleanRoom, JSON.stringify(meta))
        } else {
          return NextResponse.json({ error: { message: "Invalid host secret for this identity" } }, { status: 403 })
        }
      } else if (!meta.host || meta.host === "Unknown") {
        isHost = true
        activeHostSecret = suppliedHostSecret || crypto.randomUUID()
        meta.host = username
        meta.hostSecretEncrypted = encryptSpaceSecret(activeHostSecret)
        delete meta.hostSecret
        await roomService.updateRoomMetadata(cleanRoom, JSON.stringify(meta))
      }

      if (Array.isArray(meta.cohosts) && meta.cohosts.includes(username)) {
        if (hasCohostAccess(meta, username, suppliedCohostSecret)) {
          isCohost = true
        } else {
          return NextResponse.json({ error: { message: "Invalid co-host credentials" } }, { status: 403 })
        }
      }
    } else {
      isHost = true
      activeHostSecret = suppliedHostSecret || crypto.randomUUID()
      try {
        await roomService.updateRoomMetadata(
          cleanRoom,
          JSON.stringify({
            host: username,
            hostSecretEncrypted: encryptSpaceSecret(activeHostSecret),
            banned: [],
            cohosts: [],
          })
        )
      } catch {
        return serverError()
      }
    }
  } else {
    isHost = true
    activeHostSecret = suppliedHostSecret || crypto.randomUUID()
    try {
      await roomService.createRoom({
        name: cleanRoom,
        emptyTimeout: 43200,
        maxParticipants: 50,
        metadata: JSON.stringify({
          host: username,
          hostSecretEncrypted: encryptSpaceSecret(activeHostSecret),
          banned: [],
          cohosts: [],
        }),
      })
    } catch {
      targetRoom = await getRoomMeta()
      if (!targetRoom) return serverError()
      if (targetRoom.metadata) {
        try {
          const meta = JSON.parse(targetRoom.metadata)
          if (meta.host !== username || !hasHostAccess(meta, username, suppliedHostSecret)) {
            isHost = false
            activeHostSecret = ""
          }
        } catch {
          return serverError()
        }
      } else {
        return serverError()
      }
    }
  }

  if (targetRoom && targetRoom.numParticipants >= 50 && !isHost) {
    return NextResponse.json({ error: { message: "This space is full (max 50 participants)." } }, { status: 403 })
  }

  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET
  if (!apiKey || !apiSecret) return serverError()

  const at = new AccessToken(apiKey, apiSecret, {
    identity: username,
    metadata: JSON.stringify({ avatar }),
  })
  at.addGrant({
    room: cleanRoom,
    roomJoin: true,
    canPublish: isHost || isCohost,
    canSubscribe: true,
    canPublishData: true,
    canUpdateOwnMetadata: true,
  })

  try {
    const token = await at.toJwt()
    const response = NextResponse.json({ data: { token, isHost, isCohost, roomName: cleanRoom } })
    const roleSecret = isHost ? activeHostSecret : isCohost ? suppliedCohostSecret : ""
    if (roleSecret) {
      response.cookies.set({
        name: roleCookieName(cleanRoom),
        value: roleSecret,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/api/livekit",
        maxAge: 60 * 60 * 24 * 30,
      })
    }
    return response
  } catch {
    return serverError()
  }
}
