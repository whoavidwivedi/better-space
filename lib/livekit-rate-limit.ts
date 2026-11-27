import { NextResponse } from "next/server"

const WINDOW_MS = 60_000
const REQUEST_LIMIT = { create: 6, join: 30 }

const requests = new Map<string, number>()
let resetAt = 0

export function limitLiveKitRequest(
  req: Request,
  operation: "create" | "join"
) {
  if (process.env.VERCEL !== "1") return

  const address = req.headers.get("x-vercel-forwarded-for")
  if (!address) return

  const now = Date.now()
  if (now >= resetAt) {
    requests.clear()
    resetAt = now + WINDOW_MS
  }

  const key = `${operation}:${address}`
  const count = requests.get(key) ?? 0
  if (count >= REQUEST_LIMIT[operation]) {
    return NextResponse.json(
      { error: { message: "Too many requests. Please try again shortly." } },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((resetAt - now) / 1000)) },
      }
    )
  }

  requests.set(key, count + 1)
}
