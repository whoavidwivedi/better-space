export type StarterTemplate = {
  name: string
  aliases?: string[]
  title: string
  desc: string
  topic: string
  speakers: string[]
}

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    name: "techtwitter-india-devs-startups-craft",
    aliases: ["techtwitter-india", "techtwitter"],
    title: "#TechTwitter India: Devs, Startups & Craft",
    desc: "Devs, founders, startups & craft discussions",
    topic: "#TechTwitter India",
    speakers: ["OSLO-1", "Funny Bunny-2", "Upstream-3", "Afterclap-4"],
  },
  {
    name: "design-systems-motion-craft",
    aliases: ["design-systems", "design"],
    title: "Design Systems, Motion & Craft",
    desc: "UI craft, design tokens & interactions",
    topic: "Design & UX",
    speakers: ["OSLO-1", "OSLO-3", "Upstream-2", "Afterclap-8"],
  },
  {
    name: "building-shipping-using-zerostarter",
    aliases: ["indie-founders", "zerostarter"],
    title: "Building & Shipping using ZeroStarter",
    desc: "Solo founders, indie hacking & shipping products",
    topic: "Startups & Build",
    speakers: ["Upstream-5", "Funny Bunny-2", "Teamwork-1"],
  },
]

export function findTemplate(nameOrSlugOrTitle?: string | null): StarterTemplate | undefined {
  if (!nameOrSlugOrTitle) return undefined
  const decoded = decodeURIComponent(nameOrSlugOrTitle).trim().toLowerCase()
  return STARTER_TEMPLATES.find(
    (t) =>
      t.name.toLowerCase() === decoded ||
      t.title.toLowerCase() === decoded ||
      t.name.replace(/[-_]/g, " ").toLowerCase() === decoded ||
      (t.aliases && t.aliases.some((a) => a.toLowerCase() === decoded)) ||
      decoded.includes(t.name.toLowerCase()) ||
      t.title.toLowerCase().includes(decoded) ||
      (t.aliases && t.aliases.some((a) => decoded.includes(a.toLowerCase())))
  )
}

export function getDisplayRoomTitle(roomName: string): string {
  if (!roomName) return "Voice Space"
  const t = findTemplate(roomName)
  if (t) return t.title
  const clean = decodeURIComponent(roomName).trim()
  return clean
}
