// Brand identity for this app: the single source a fork edits to rebrand.
export const site = {
  name: "Better Space",
  description: "Drop into live voice rooms directly in your browser. Talk with crisp, low-latency WebRTC spatial audio. 100% ephemeral with zero logins or accounts needed.",
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
