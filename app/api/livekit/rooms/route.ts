import { AccessToken, RoomServiceClient } from "livekit-server-sdk"
import { NextRequest, NextResponse } from "next/server"
import { getEndedSpace, isSpaceEnded } from "@/lib/ended-spaces"
import {
  readBrowserSession,
  roomParticipantIdentity,
  setBrowserSession,
} from "@/lib/browser-session"
import { limitLiveKitRequest } from "@/lib/livekit-rate-limit"
import {
  closureMarkerName,
  isClosureMarker,
  readRoomClosure,
} from "@/lib/livekit-room-closure"
import { ROOM_SLUG_PATTERN } from "@/lib/presets"
import { hasHostAccess, hashHostSecret, roleCookieName } from "@/lib/space-auth"

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
  const checkName =
    req.nextUrl.searchParams.get("space") ||
    req.nextUrl.searchParams.get("room")
  if (checkName) {
    const cleanRoom = checkName.toLowerCase().trim()
    if (isSpaceEnded(cleanRoom)) {
      const ended = getEndedSpace(cleanRoom)
      return NextResponse.json({
        ended: true,
        data: { ended: true, space: ended },
      })
    }
    try {
      const roomService = getRoomService()
      const liveRooms = await roomService.listRooms([
        cleanRoom,
        closureMarkerName(cleanRoom),
      ])
      const closure = readRoomClosure(liveRooms, cleanRoom)
      if (closure?.closing) {
        return NextResponse.json(
          { error: { message: "This space is closing" } },
          { status: 503 }
        )
      }
      if (closure) {
        const space = {
          name: cleanRoom,
          host: closure.host,
          endedAt: closure.endedAt,
        }
        return NextResponse.json({ ended: true, data: { ended: true, space } })
      }
      const r = liveRooms.find((rm) => rm.name.toLowerCase() === cleanRoom)
      if (r?.metadata) {
        try {
          const meta = JSON.parse(r.metadata)
          if (meta.ended) {
            return NextResponse.json({
              ended: true,
              data: {
                ended: true,
                space: {
                  name: cleanRoom,
                  host: meta.hostName || meta.host || "Unknown",
                  endedAt: meta.endedAt ?? Date.now(),
                },
              },
            })
          }
        } catch {}
      }
      if (r) {
        return NextResponse.json({
          ended: false,
          live: true,
          data: { ended: false, live: true },
        })
      }
    } catch {
      return NextResponse.json(
        { error: { message: "Could not check this space" } },
        { status: 503 }
      )
    }
    return NextResponse.json({
      ended: false,
      live: false,
      data: { ended: false, live: false },
    })
  }

  try {
    const now = Date.now()
    if (!lobbySnapshot || lobbySnapshot.expiresAt <= now) {
      const pending = loadLobbySnapshot(getRoomService())
      lobbySnapshot = { pending, expiresAt: Infinity }
      void pending.then(
        () => {
          if (lobbySnapshot?.pending === pending) {
            lobbySnapshot.expiresAt = Date.now() + LOBBY_CACHE_MS
          }
        },
        () => {
          if (lobbySnapshot?.pending === pending) lobbySnapshot = undefined
        }
      )
    }

    return NextResponse.json(
      { data: await lobbySnapshot.pending },
      {
        headers: {
          "Vercel-CDN-Cache-Control": "public, s-maxage=5",
        },
      }
    )
  } catch {
    return NextResponse.json(
      { error: { message: "Could not load live spaces" } },
      { status: 503 }
    )
  }
}

const LOBBY_CACHE_MS = 5_000
let lobbySnapshot:
  | { pending: ReturnType<typeof loadLobbySnapshot>; expiresAt: number }
  | undefined

async function loadLobbySnapshot(roomService: RoomServiceClient) {
  const all = await roomService.listRooms()
  const markers = new Set(
    all.filter((room) => isClosureMarker(room.name)).map((room) => room.name)
  )
  const rooms = all.filter((r) => {
    if (
      isClosureMarker(r.name) ||
      markers.has(closureMarkerName(r.name)) ||
      isSpaceEnded(r.name)
    ) {
      return false
    }
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
        if (r.numParticipants > 0) {
          participants = await roomService.listParticipants(r.name)
        }
      } catch {}

      let host = "Unknown"
      try {
        if (r.metadata) {
          const meta = JSON.parse(r.metadata)
          if (meta.host) host = meta.hostName || meta.host
        }
      } catch {}

      if (host === "Unknown" && participants.length > 0) {
        host = participants[0].name || participants[0].identity
      }

      return {
        name: r.name,
        numParticipants: r.numParticipants,
        host,
        // Seconds since the epoch, from LiveKit.
        createdAt: Number(r.creationTime),
        participants: participants
          .map((p) => {
            let avatar = p.identity
            try {
              if (p.metadata) {
                const meta = JSON.parse(p.metadata)
                if (typeof meta.avatar === "string" && meta.avatar)
                  avatar = meta.avatar
              }
            } catch {}
            return {
              identity: p.identity,
              avatar,
              onMic: Boolean(p.permission?.canPublish),
            }
          })
          .slice(0, 8),
      }
    })
  )

  return roomDetails
}

export async function POST(req: NextRequest) {
  const limited = limitLiveKitRequest(req, "create")
  if (limited) return limited

  const body = await req.json().catch(() => null)
  if (
    !body ||
    typeof body.roomName !== "string" ||
    typeof body.hostName !== "string" ||
    (body.avatar !== undefined && typeof body.avatar !== "string")
  ) {
    return NextResponse.json(
      { error: { message: "Invalid room name, host name, or avatar" } },
      { status: 400 }
    )
  }

  const cleanRoom = body.roomName.trim()
  const cleanHost = body.hostName.trim().slice(0, 30)
  const avatar = body.avatar?.trim().slice(0, 128) || cleanHost
  if (!cleanHost) {
    return NextResponse.json(
      { error: { message: "Missing host name" } },
      { status: 400 }
    )
  }

  if (!ROOM_SLUG_PATTERN.test(cleanRoom)) {
    return NextResponse.json(
      { error: { message: "Invalid room name" } },
      { status: 400 }
    )
  }

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

  const session = readBrowserSession(req)
  const hostIdentity = roomParticipantIdentity(session, cleanRoom)
  const hostSecret = crypto.randomUUID()

  try {
    const allRooms = await roomService.listRooms()
    const closure = readRoomClosure(allRooms, cleanRoom)
    if (closure) {
      return NextResponse.json(
        closure.closing
          ? { error: { message: "This space is closing" } }
          : { ended: true, error: "Space has ended" },
        { status: closure.closing ? 503 : 410 }
      )
    }
    for (const r of allRooms) {
      if (isClosureMarker(r.name)) continue
      if (r.metadata) {
        try {
          const meta = JSON.parse(r.metadata)
          if (
            !meta.ended &&
            (meta.host === roomParticipantIdentity(session, r.name) ||
              hasHostAccess(
                meta,
                meta.host,
                req.cookies.get(roleCookieName(r.name))?.value ?? ""
              ))
          ) {
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
  } catch {
    return NextResponse.json(
      { error: { message: "Could not verify room availability" } },
      { status: 503 }
    )
  }

  await roomService.createRoom({
    name: cleanRoom,
    emptyTimeout: 43200,
    metadata: JSON.stringify({
      host: hostIdentity,
      hostName: cleanHost,
      hostSecretHash: hashHostSecret(hostSecret),
      banned: [],
      cohosts: [],
      createdAt: Date.now(),
    }),
  })

  lobbySnapshot = undefined

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    {
      identity: hostIdentity,
      name: cleanHost,
      metadata: JSON.stringify({ avatar }),
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
  const response = NextResponse.json({ data: { roomName: cleanRoom, token } })
  setBrowserSession(response, session)
  response.cookies.set({
    name: roleCookieName(cleanRoom),
    value: hostSecret,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/api/livekit",
    maxAge: 60 * 60 * 24 * 30,
  })
  return response
}
