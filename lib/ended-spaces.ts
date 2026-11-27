import fs from "fs"
import path from "path"

export type EndedSpaceParticipant = { identity: string; avatar?: string }

export type EndedSpace = {
  name: string
  endedAt: number
  host: string
}

const DATA_DIR = path.join(process.cwd(), ".data")
const FILE = path.join(DATA_DIR, "ended-spaces.json")

let cache: Record<string, EndedSpace> | null = null

function load(): Record<string, EndedSpace> {
  if (cache) return cache
  try {
    if (fs.existsSync(FILE)) {
      const stored = JSON.parse(fs.readFileSync(FILE, "utf-8")) as Record<
        string,
        EndedSpace
      >
      cache = Object.fromEntries(
        Object.entries(stored).map(([key, { name, endedAt, host }]) => [
          key,
          { name, endedAt, host },
        ])
      )
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
  const key = name.toLowerCase().trim()
  return Boolean(load()[key])
}

export function getEndedSpace(name: string): EndedSpace | null {
  if (!name) return null
  const key = name.toLowerCase().trim()
  const ended = load()[key]
  if (!ended?.name) return null
  // Older files may include a roster. Never return it to a caller.
  return { name: ended.name, host: ended.host, endedAt: ended.endedAt }
}

export function markSpaceEnded(name: string, host: string): void {
  if (!name) return
  const key = name.toLowerCase().trim()
  const existing = getEndedSpace(key)
  load()[key] = {
    name: key,
    endedAt: existing?.endedAt ?? Date.now(),
    host: host || existing?.host || "Unknown",
  }
  persist()
}
