// Brand identity for this app: the single source a fork edits to rebrand.
export const site = {
  name: "Better Space",
  description:
    "Drop into live voice rooms directly in your browser. Crisp WebRTC spatial audio with zero logins, passwords, or tracking.",
  tagline: "Real-time voice. Zero accounts.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://space.whoavidwivedi.work",
  keywords: [
    "voice rooms",
    "live audio",
    "audio spaces",
    "voice chat",
    "WebRTC",
    "spatial audio",
    "no sign-up voice chat",
    "browser voice chat",
    "Twitter Spaces alternative",
    "Clubhouse alternative",
  ],
  creator: {
    name: "Avi Dwivedi",
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

// Per-page metadata. Next replaces openGraph and twitter wholesale in a child
// segment, so each page restates them or it would share the home page's.
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string
  description: string
  path: string
}) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: site.name,
      title: `${title} | ${site.name}`,
      description,
      url: path,
    },
    twitter: {
      card: "summary_large_image",
      site: `@${site.creator.handle}`,
      creator: `@${site.creator.handle}`,
      title: `${title} | ${site.name}`,
      description,
    },
  } as const
}
