export type RecentSpace = {
  name: string
  displayName?: string
  host: string
  numParticipants: number
  participants: string[]
  endedAt: number
  endedByHost: boolean
}

// Global in-memory storage for recent/ended spaces across API routes
declare global {
  var __betterSpaceRecentRooms: RecentSpace[] | undefined
  var __betterSpaceKnownRooms:
    | Map<
        string,
        {
          host: string
          displayName?: string
          participants: string[]
          numParticipants: number
        }
      >
    | undefined
}

const MAX_RECENT_SPACES = 20

function getRecentStore(): RecentSpace[] {
  if (!globalThis.__betterSpaceRecentRooms) {
    globalThis.__betterSpaceRecentRooms = []
  }
  return globalThis.__betterSpaceRecentRooms
}

function getKnownStore(): Map<
  string,
  {
    host: string
    displayName?: string
    participants: string[]
    numParticipants: number
  }
> {
  if (!globalThis.__betterSpaceKnownRooms) {
    globalThis.__betterSpaceKnownRooms = new Map()
  }
  return globalThis.__betterSpaceKnownRooms
}

export function recordKnownRoom(
  name: string,
  details: {
    host: string
    displayName?: string
    participants: string[]
    numParticipants: number
  }
) {
  const store = getKnownStore()
  store.set(name, details)
}

export function getKnownRoom(name: string) {
  return getKnownStore().get(name)
}

export function deleteKnownRoom(name: string) {
  getKnownStore().delete(name)
}

export function addRecentSpace(space: RecentSpace) {
  const list = getRecentStore()
  // Remove if already in list to update to top
  const filtered = list.filter((s) => s.name !== space.name)
  filtered.unshift(space)
  if (filtered.length > MAX_RECENT_SPACES) {
    filtered.length = MAX_RECENT_SPACES
  }
  globalThis.__betterSpaceRecentRooms = filtered
}

export function getRecentSpaces(): RecentSpace[] {
  return getRecentStore()
}
