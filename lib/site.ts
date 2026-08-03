// Brand identity for this app: the single source a fork edits to rebrand.
export const site = {
  name: "Better Space",
  description:
    "Live audio rooms in your browser. Pick a name, no signup, and talk.",
  tagline: "Real-time voice. Zero accounts.",
  creator: {
    handle: "whoavidwivedi",
    website: "https://whoavidwivedi.work",
    social: {
      github: "https://github.com/whoavidwivedi",
      x: "https://x.com/whoavidwivedi",
      instagram: "https://instagram.com/whoavidwivedi",
      linkedin: "https://linkedin.com/in/whoavidwivedi",
    },
  },
} as const

export type Site = typeof site
