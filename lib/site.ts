// Brand identity for this app: the single source a fork edits to rebrand.
export const site = {
  name: "Better Space",
  description: "Live audio rooms in your browser. Pick a name, no signup, and talk.",
  tagline: "Real-time voice. Zero accounts.",
  social: {
    github: "",
    x: "",
    discord: "",
  },
} as const

export type Site = typeof site
