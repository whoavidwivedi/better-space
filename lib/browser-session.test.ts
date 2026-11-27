import { expect, test } from "bun:test"
import { NextRequest, NextResponse } from "next/server"
import {
  readBrowserSession,
  roomParticipantIdentity,
  setBrowserSession,
} from "./browser-session"

test("browser identities survive a display-name change and are scoped to the room", () => {
  const previousSecret = process.env.LIVEKIT_API_SECRET
  process.env.LIVEKIT_API_SECRET = "test-signing-value"
  try {
    const url = "http://localhost/api/livekit/token"
    const anonymous = new NextRequest(url)
    const id = readBrowserSession(anonymous)
    const response = new NextResponse()
    setBrowserSession(response, id)
    const cookie = response.headers.get("set-cookie")!.split(";")[0]
    const rejoin = new NextRequest(url, { headers: { cookie } })
    expect(readBrowserSession(rejoin)).toBe(id)
    expect(roomParticipantIdentity(id, "test-room")).toBe(
      roomParticipantIdentity(readBrowserSession(rejoin), "test-room")
    )
    expect(roomParticipantIdentity(id, "test-room")).not.toBe(
      roomParticipantIdentity(id, "other-room")
    )
    const tampered = new NextRequest(url, { headers: { cookie: cookie + "x" } })
    expect(readBrowserSession(tampered)).not.toBe(id)
  } finally {
    if (previousSecret === undefined) delete process.env.LIVEKIT_API_SECRET
    else process.env.LIVEKIT_API_SECRET = previousSecret
  }
})
