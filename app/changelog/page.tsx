import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { Navbar } from "@/components/common/navbar"
import { Footer } from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "A public record of Better Space features, improvements, and fixes.",
  alternates: { canonical: "/changelog" },
}

const releases = [
  {
    version: "v1.3.8",
    date: "2026-08-21",
    label: "Cleaner emoji reactions",
    summary:
      "The emoji reaction popover got a refresh, making it quicker to react during a live space.",
    highlights: [
      "A simpler, more focused reaction picker.",
      "Reactions stay out of the way of room controls.",
    ],
  },
  {
    version: "v1.3.3",
    date: "2026-08-21",
    label: "Public changelog & keyboard-safe popovers",
    summary:
      "The project history is now public, and Launch Space stays anchored when the mobile keyboard opens.",
    highlights: [
      "Added a public changelog covering every published release.",
      "Kept the launch popover below its trigger instead of flipping into the keyboard area.",
      "Linked the changelog from the public footer for easy discovery.",
    ],
  },
  {
    version: "v1.3.2",
    date: "2026-08-21",
    label: "Mobile launch form stability",
    summary:
      "Launch Space now stays anchored when the mobile keyboard opens, so the form remains where you left it.",
    highlights: [
      "Preserved the page position while the launch form is open.",
      "Restored the original scroll state when the form closes.",
    ],
  },
  {
    version: "v1.3.1",
    date: "2026-08-21",
    label: "Cohost permission synchronization",
    summary:
      "Cohost role changes now stay in sync with LiveKit publish permissions from the API to the room UI.",
    highlights: [
      "New cohosts receive access before moderation controls activate.",
      "Revoked cohosts lose publish access consistently.",
    ],
  },
  {
    version: "v1.3.0",
    date: "2026-08-21",
    label: "Cohost controls & secure moderation",
    summary:
      "Hosts can now share the room workload without sharing authority, with cohost moderation and end-space controls.",
    highlights: [
      "Added cohost promotion, revocation, and end-space controls.",
      "Moderation actions are enforced securely on the server.",
    ],
  },
  {
    version: "v1.2.1",
    date: "2026-08-14",
    label: "Footer & brand polish",
    summary:
      "The public surface got a clearer footer and a more consistent Better Space identity.",
    highlights: [
      "Added direct Website, GitHub, X, and LinkedIn links.",
      "Refreshed branding across the site for a consistent look.",
    ],
  },
  {
    version: "v1.2.0",
    date: "2026-08-07",
    label: "Lobby redesign & security hardening",
    summary:
      "A cleaner monochrome lobby arrived alongside stronger security behind the scenes.",
    highlights: [
      "Migrated interface icons to Lucide and standardized buttons.",
      "Refined lobby cards, footer, and responsive states.",
      "Strengthened API security and closed privacy gaps.",
    ],
  },
  {
    version: "v1.1.0",
    date: "2026-08-07",
    label: "Mobile experience & space lifecycle",
    summary:
      "Better Space became more dependable across devices and links.",
    highlights: [
      "Added responsive lobby and room experiences for mobile and tablet.",
      "Ended spaces now stay closed, so old invite links no longer reopen them.",
    ],
  },
  {
    version: "v1.0.2",
    date: "2026-08-04",
    label: "Avatar fixes & accessibility",
    summary:
      "Avatars became reliable under load, and the app respects your motion preferences.",
    highlights: [
      "Reduced avatar picker request pressure and fixed blank avatar states.",
      "Addressed dependency security advisories.",
      "Respected reduced-motion preferences.",
    ],
  },
  {
    version: "v1.0.0",
    date: "2026-08-04",
    label: "Production audio spaces",
    summary:
      "The first production release brought low-latency voice rooms, host moderation, and a mobile-ready PWA.",
    highlights: [
      "Added LiveKit-powered audio spaces with host and cohost moderation.",
      "Added Krisp noise suppression, device switching, visualizers, and mic controls.",
      "Added avatars, per-space identity, installable PWA support, and a public lobby.",
    ],
  },
]

function formatReleaseDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00Z`))
}

export default function ChangelogPage() {
  return (
    <div className="min-h-svh bg-background text-foreground selection:bg-foreground selection:text-background">
      <Navbar />

      <main>
        <header className="border-b border-border">
          <div className="mx-auto max-w-3xl px-4 pt-16 pb-12 sm:px-6 sm:pt-24 sm:pb-16">
            <p className="font-mono text-[10px] font-bold tracking-[0.22em] text-muted-foreground uppercase">
              Changelog
            </p>
            <h1 className="mt-4 font-display text-4xl leading-[1.02] font-black tracking-[-0.04em] sm:text-6xl">
              What shipped,
              <span className="block font-serif-display font-normal text-muted-foreground italic">
                and when.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">
              Every release of Better Space — features, improvements, and
              fixes. {releases.length} releases so far.
            </p>
          </div>
        </header>

        <section className="mx-auto max-w-3xl px-4 sm:px-6">
          {releases.map((release, index) => (
            <article
              key={release.version}
              className="grid gap-2 border-b border-border py-10 sm:grid-cols-[9rem_1fr] sm:gap-8 sm:py-12"
            >
              <div className="sm:pt-1">
                <time
                  dateTime={release.date}
                  className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase"
                >
                  {formatReleaseDate(release.date)}
                </time>
                <p className="mt-1 font-mono text-xs font-bold tracking-wider text-foreground">
                  {release.version}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-xl leading-tight font-bold tracking-tight sm:text-2xl">
                    {release.label}
                  </h2>
                  {index === 0 && (
                    <span className="shrink-0 rounded-full border border-border px-2 py-0.5 font-mono text-[9px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                      Latest
                    </span>
                  )}
                </div>
                <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                  {release.summary}
                </p>
                <ul className="mt-5 space-y-2 text-sm leading-6">
                  {release.highlights.map((highlight) => (
                    <li key={highlight} className="flex gap-3">
                      <span
                        aria-hidden="true"
                        className="text-muted-foreground/60"
                      >
                        –
                      </span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`https://github.com/whoavidwivedi/better-space/releases/tag/${release.version}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider text-muted-foreground uppercase transition-colors hover:text-foreground"
                >
                  {release.version} on GitHub
                  <ArrowUpRight size={12} aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </section>

        <section className="border-t border-border">
          <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-muted-foreground">
              Follow along on GitHub for release notes as they land.
            </p>
            <Link
              href="/lobby"
              className="inline-flex w-fit items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 font-mono text-[10px] font-bold tracking-wider text-background uppercase transition-colors hover:bg-foreground/90"
            >
              Open the lobby
              <ArrowUpRight size={13} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
