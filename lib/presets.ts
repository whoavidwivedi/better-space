export type StarterTemplate = {
  name: string
  title: string
  desc: string
  topic: string
  speakers: string[]
}

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    name: "techbetterspace-india-devs-startups-craft",
    title: "#TechBetterSpace India: Devs, Startups & Craft",
    desc: "Devs, founders, startups & craft discussions",
    topic: "#TechBetterSpace India",
    speakers: ["OSLO-1", "Funny Bunny-2", "Upstream-3", "Afterclap-4"],
  },
  {
    name: "design-systems-motion-craft",
    title: "Design Systems, Motion & Craft",
    desc: "UI craft, design tokens & interactions",
    topic: "Design & UX",
    speakers: ["OSLO-1", "OSLO-3", "Upstream-2", "Afterclap-8"],
  },
  {
    name: "building-shipping-using-zerostarter",
    title: "Building & Shipping using ZeroStarter",
    desc: "Solo founders, indie hacking & shipping products",
    topic: "Startups & Build",
    speakers: ["Upstream-5", "Funny Bunny-2", "Teamwork-1"],
  },
]

export const ROOM_CODE_PATTERN = /-[a-z0-9]{6}$/i

// The longest name a person types; launching adds a 7-character room code.
export const ROOM_NAME_MAX = 48

// A room's full name as the API accepts it: name plus code, nothing else.
export const ROOM_SLUG_PATTERN = new RegExp(
  `^[a-z0-9_-]{1,${ROOM_NAME_MAX + 7}}$`,
  "i"
)

const CODE_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789"

export function toSlug(name: string): string {
  if (!name) return ""
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function genRoomCode(): string {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(6)
    crypto.getRandomValues(bytes)
    return Array.from(bytes)
      .map((b) => CODE_CHARS[b % CODE_CHARS.length])
      .join("")
  }
  return Math.random().toString(36).substring(2, 8).padEnd(6, "0")
}

export function generateRoomSlug(baseName: string): string {
  const cleanBase = toSlug(baseName) || "space"
  return `${cleanBase}-${genRoomCode()}`
}

export function stripRoomCode(roomName: string): string {
  if (!roomName) return roomName
  const cleaned = decodeURIComponent(roomName).trim()
  return cleaned.replace(ROOM_CODE_PATTERN, "") || cleaned
}

// The template a live room was launched from: its name (the slug of its
// title) exactly, with or without the room code, or its title. Anything else,
// even a template name with a word changed, is a room of its own. A name
// still being typed has no code, so compare it to `t.name` directly.
export function findTemplate(
  nameOrSlugOrTitle?: string | null
): StarterTemplate | undefined {
  if (!nameOrSlugOrTitle) return undefined
  const raw = nameOrSlugOrTitle.trim().toLowerCase()
  const base = stripRoomCode(raw)
  return STARTER_TEMPLATES.find(
    (t) => t.name === raw || t.name === base || t.title.toLowerCase() === raw
  )
}

export function getDisplayRoomTitle(roomName: string): string {
  if (!roomName) return "Voice Space"
  const t = findTemplate(roomName)
  if (t) return t.title
  const clean = stripRoomCode(roomName)
  return clean
}
