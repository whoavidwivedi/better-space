import fs from "fs"
import path from "path"

export type EndedSpaceParticipant = { identity: string; avatar?: string }

export type EndedSpace = {
  name: string
  endedAt: number
  host: string
  cohosts: string[]
  speakers: EndedSpaceParticipant[]
}

const DATA_DIR = path.join(process.cwd(), ".data")
const FILE = path.join(DATA_DIR, "ended-spaces.json")

let cache: Record<string, EndedSpace> | null = null

function load(): Record<string, EndedSpace> {
  if (cache) return cache
  try {
    if (fs.existsSync(FILE)) {
      cache = JSON.parse(fs.readFileSync(FILE, "utf-8")) as Record<string, EndedSpace>
    }
  } catch {
    cache = {}
  }
  cache = cache || {}
  return cache
}

function persist() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    fs.writeFileSync(FILE, JSON.stringify(cache, null, 2))
  } catch {
    // Best effort; non-fatal if filesystem is read-only.
  }
}

export function isSpaceEnded(name: string): boolean {
  if (!name) return false
  return Boolean(load()[name])
}

export function getEndedSpace(name: string): EndedSpace | null {
  if (!name) return null
  return load()[name] ?? null
}

export function markSpaceEnded(
  name: string,
  info: { host: string; cohosts: string[]; speakers: EndedSpaceParticipant[] },
): void {
  if (!name) return
  const existing = load()[name]
  load()[name] = {
    name,
    endedAt: existing?.endedAt ?? Date.now(),
    host: info.host || existing?.host || "Unknown",
    cohosts: info.cohosts?.length ? info.cohosts : existing?.cohosts ?? [],
    speakers: info.speakers?.length ? info.speakers : existing?.speakers ?? [],
  }
  persist()
}