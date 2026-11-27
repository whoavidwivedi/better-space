import { AccessToken, RoomServiceClient } from "livekit-server-sdk"
import { NextRequest, NextResponse } from "next/server"
import { readEndedRoster } from "@/lib/ended-roster"
import { getEndedSpace, isSpaceEnded } from "@/lib/ended-spaces"
import {
  readBrowserSession,
  roomParticipantIdentity,
  setBrowserSession,
} from "@/lib/browser-session"
import { ROOM_SLUG_PATTERN } from "@/lib/presets"
import {
  hasCohostAccess,
  hasHostAccess,
  hashHostSecret,
  hostSecretMatches,
  roleCookieName,
} from "@/lib/space-auth"

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
  const avatarQuery = req.nextUrl.searchParams.get("avatar")
  const hostSecret = req.headers.get("x-host-secret")?.trim() ?? ""
  const cohostSecret = req.headers.get("x-cohost-secret")?.trim() ?? ""

  if (!room) {
    return NextResponse.json(
      { error: { message: "Missing room" } },
      { status: 400 }
    )
  }

  const cleanRoom = room.trim()
  const avatar = avatarQuery?.trim() ?? ""

  if (!ROOM_SLUG_PATTERN.test(cleanRoom)) {
    return NextResponse.json(
      { error: { message: "Invalid room name" } },
      { status: 400 }
    )
  }

  const savedRoleSecret =
    req.cookies.get(roleCookieName(cleanRoom))?.value ?? ""
  const suppliedHostSecret = hostSecret || savedRoleSecret
  const suppliedCohostSecret = cohostSecret || savedRoleSecret

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

  let targetRoom
  try {
    const rooms = await roomService.listRooms([cleanRoom])
    targetRoom = rooms.find((room) => room.name === cleanRoom)
  } catch {
    return NextResponse.json(
      { error: { message: "Could not verify this space. Please try again." } },
      { status: 503 }
    )
  }

  if (!targetRoom) {
    return NextResponse.json(
      { error: { message: "This space is no longer live" } },
      { status: 404 }
    )
  }

  const session = readBrowserSession(req)
  let identity = roomParticipantIdentity(session, cleanRoom)
  let isHost = false
  let isCohost = false
  let activeHostSecret = hostSecret

  if (targetRoom.metadata) {
    try {
      const meta = JSON.parse(targetRoom.metadata)
      if (!meta.createdAt && targetRoom.creationTime) {
        meta.createdAt = Number(targetRoom.creationTime) * 1000
        try {
          await roomService.updateRoomMetadata(cleanRoom, JSON.stringify(meta))
        } catch {}
      }
      if (meta.ended) {
        const endedData = {
          name: cleanRoom,
          endedAt: meta.endedAt ?? Date.now(),
          host: meta.hostName || meta.host || "Unknown",
          cohosts: Array.isArray(meta.cohosts) ? meta.cohosts : [],
          speakers: readEndedRoster(meta.speakers),
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
      const legacyRoom = !meta.hostName
      if (
        Array.isArray(meta.banned) &&
        (meta.banned.includes(identity) ||
          (legacyRoom && meta.banned.includes(username)))
      ) {
        return NextResponse.json(
          { error: { message: "You have been kicked from this space" } },
          { status: 403 }
        )
      }

      if (
        typeof meta.host === "string" &&
        hasHostAccess(meta, meta.host, suppliedHostSecret)
      ) {
        identity = meta.host
        isHost = true
        activeHostSecret = suppliedHostSecret
      } else if (
        legacyRoom &&
        meta.host === username &&
        !meta.hostSecretHash &&
        typeof meta.hostSecret === "string" &&
        hostSecretMatches(hashHostSecret(meta.hostSecret), suppliedHostSecret)
      ) {
        identity = meta.host
        activeHostSecret = crypto.randomUUID()
        delete meta.hostSecret
        meta.hostSecretHash = hashHostSecret(activeHostSecret)
        await roomService.updateRoomMetadata(cleanRoom, JSON.stringify(meta))
        isHost = true
      } else if (meta.host === identity) {
        return NextResponse.json(
          { error: { message: "Invalid host credentials for this browser" } },
          { status: 403 }
        )
      }

      if (!isHost && Array.isArray(meta.cohosts)) {
        const eligible = legacyRoom ? [identity, username] : [identity]
        const cohost = eligible.find((candidate) =>
          hasCohostAccess(meta, candidate, suppliedCohostSecret)
        )
        if (cohost) {
          identity = cohost
          isCohost = true
        } else if (meta.cohosts.includes(identity)) {
          return NextResponse.json(
            { error: { message: "Invalid co-host credentials" } },
            { status: 403 }
          )
        }
      }
    } catch {
      return NextResponse.json(
        {
          error: { message: "Could not verify this space. Please try again." },
        },
        { status: 503 }
      )
    }
  }

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    {
      identity,
      name: username,
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
  const response = NextResponse.json({
    data: {
      token,
      isHost,
      isCohost,
      roomName: cleanRoom,
    },
  })
  setBrowserSession(response, session)
  const roleSecret = isHost
    ? activeHostSecret
    : isCohost
      ? suppliedCohostSecret
      : ""
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
}
