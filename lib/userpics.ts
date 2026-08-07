export const USERPIC_NAMES: string[] = [
  "01",
  "Afterclap-1",
  "Afterclap-2",
  "Afterclap-3",
  "Afterclap-4",
  "Afterclap-5",
  "Afterclap-6",
  "Afterclap-7",
  "Afterclap-8",
  "Afterclap-9",
  "Afterclap",
  "Cranks-1",
  "Cranks-2",
  "Cranks",
  "Delivery boy-1",
  "Delivery boy-2",
  "Delivery boy-3",
  "Delivery boy-4",
  "Delivery boy-5",
  "Delivery boy",
  "E-commerce-1",
  "E-commerce-2",
  "E-commerce",
  "Funny Bunny-1",
  "Funny Bunny-2",
  "Funny Bunny-3",
  "Funny Bunny-4",
  "Funny Bunny-5",
  "Funny Bunny-6",
  "Funny Bunny-7",
  "Funny Bunny-8",
  "Funny Bunny",
  "Guacamole-1",
  "Guacamole-2",
  "Guacamole-3",
  "Guacamole",
  "Juicy-1",
  "Juicy",
  "No comments 3",
  "No comments 4",
  "No comments 5",
  "No comments 6",
  "No comments 7",
  "No comments 8",
  "No comments 9",
  "No Comments-1",
  "No Comments-2",
  "No Comments-3",
  "No Comments",
  "No gravity-1",
  "No gravity-2",
  "No gravity-3",
  "No gravity",
  "OSLO-1",
  "OSLO-10",
  "OSLO-11",
  "OSLO-12",
  "OSLO-13",
  "OSLO-14",
  "OSLO-2",
  "OSLO-3",
  "OSLO-4",
  "OSLO-5",
  "OSLO-6",
  "OSLO-7",
  "OSLO-8",
  "OSLO-9",
  "OSLO",
  "Teamwork-1",
  "Teamwork-2",
  "Teamwork-3",
  "Teamwork-4",
  "Teamwork-5",
  "Teamwork-6",
  "Teamwork-7",
  "Teamwork-8",
  "Teamwork",
  "Upstream-1",
  "Upstream-10",
  "Upstream-11",
  "Upstream-12",
  "Upstream-13",
  "Upstream-14",
  "Upstream-15",
  "Upstream-16",
  "Upstream-17",
  "Upstream-2",
  "Upstream-3",
  "Upstream-4",
  "Upstream-5",
  "Upstream-6",
  "Upstream-7",
  "Upstream-8",
  "Upstream-9",
  "Upstream",
]

export const ALL_USERPICS = USERPIC_NAMES

export type CharacterCollection = {
  id: string
  name: string
  tagline: string
  description?: string
  badgeColor: string
  characters: string[]
}

export const CHARACTER_COLLECTIONS: CharacterCollection[] = [
  {
    id: "all",
    name: "All Characters",
    tagline: "The complete 96-avatar cast",
    description: "The complete 96-avatar handcrafted vector cast",
    badgeColor: "bg-foreground/10 text-foreground",
    characters: USERPIC_NAMES,
  },
  {
    id: "oslo",
    name: "OSLO Studio",
    tagline: "Minimalist Scandinavian expressive faces",
    description: "Minimalist Scandinavian expressive faces with bold geometry",
    badgeColor: "bg-foreground/10 text-foreground",
    characters: USERPIC_NAMES.filter((n) => n.startsWith("OSLO")),
  },
  {
    id: "upstream",
    name: "Upstream Pioneers",
    tagline: "Visionaries and deep conversation leads",
    description: "Visionaries and deep conversation leads",
    badgeColor: "bg-foreground/10 text-foreground",
    characters: USERPIC_NAMES.filter((n) => n.startsWith("Upstream")),
  },
  {
    id: "afterclap",
    name: "Afterclap Crew",
    tagline: "Energetic reactors and applause instigators",
    description: "Energetic reactors and applause instigators",
    badgeColor: "bg-foreground/10 text-foreground",
    characters: USERPIC_NAMES.filter((n) => n.startsWith("Afterclap")),
  },
  {
    id: "funny-bunny",
    name: "Funny Bunny Club",
    tagline: "Playful, witty, and lighthearted avatars",
    description: "Playful, witty, and lighthearted avatars",
    badgeColor: "bg-foreground/10 text-foreground",
    characters: USERPIC_NAMES.filter((n) => n.startsWith("Funny Bunny")),
  },
  {
    id: "delivery-boy",
    name: "Dispatch & Delivery",
    tagline: "Always on the move with quick dispatches",
    description: "Always on the move with quick dispatches",
    badgeColor: "bg-foreground/10 text-foreground",
    characters: USERPIC_NAMES.filter((n) => n.startsWith("Delivery boy")),
  },
  {
    id: "teamwork",
    name: "Teamwork Guild",
    tagline: "Collaborative and squad-first spirits",
    description: "Collaborative and squad-first spirits",
    badgeColor: "bg-foreground/10 text-foreground",
    characters: USERPIC_NAMES.filter((n) => n.startsWith("Teamwork")),
  },
  {
    id: "guacamole",
    name: "Guacamole Lounge",
    tagline: "Chill, laid-back hangout specialists",
    description: "Chill, laid-back hangout specialists",
    badgeColor: "bg-foreground/10 text-foreground",
    characters: USERPIC_NAMES.filter((n) => n.startsWith("Guacamole")),
  },
  {
    id: "cranks-gravity",
    name: "Cranks & No Gravity",
    tagline: "Weightless dreamers and retro tinkerers",
    description: "Weightless dreamers and retro tinkerers",
    badgeColor: "bg-foreground/10 text-foreground",
    characters: USERPIC_NAMES.filter(
      (n) =>
        n.startsWith("Cranks") ||
        n.startsWith("No gravity") ||
        n.startsWith("No comments") ||
        n.startsWith("No Comments")
    ),
  },
]

function hashSeed(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return hash
}

export function randomUserpic() {
  return USERPIC_NAMES[Math.floor(Math.random() * USERPIC_NAMES.length)]
}

export function userpicUrl(seed?: string | null) {
  if (!seed) return "/Userpics/SVG/Circle/OSLO-1.svg"
  const name = USERPIC_NAMES.includes(seed)
    ? seed
    : USERPIC_NAMES[hashSeed(seed) % USERPIC_NAMES.length]
  return `/Userpics/SVG/Circle/${encodeURIComponent(name)}.svg`
}

export function getCharacterCollection(name: string): CharacterCollection {
  const found = CHARACTER_COLLECTIONS.slice(1).find((col) =>
    col.characters.includes(name)
  )
  return found || CHARACTER_COLLECTIONS[0]
}
