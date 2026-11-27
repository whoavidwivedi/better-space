import type { NextRequest, NextResponse } from "next/server"
import { hashHostSecret, hostSecretMatches } from "@/lib/space-auth"

const COOKIE = "better_space_browser"
const UUID = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/

export function readBrowserSession(request: NextRequest) {
  const [id, signature] = (request.cookies.get(COOKIE)?.value ?? "").split(".")
  if (UUID.test(id) && hostSecretMatches(signature, `browser-session:${id}`)) {
    return id
  }
  return crypto.randomUUID()
}

export function roomParticipantIdentity(session: string, roomName: string) {
  return `guest_${hashHostSecret(`room-participant:${session}:${roomName}`)}`
}

export function setBrowserSession(response: NextResponse, id: string) {
  response.cookies.set({
    name: COOKIE,
    value: `${id}.${hashHostSecret(`browser-session:${id}`)}`,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/api/livekit",
    maxAge: 60 * 60 * 24 * 30,
  })
}
