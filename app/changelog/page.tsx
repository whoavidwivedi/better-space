import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { Navbar } from "@/components/common/navbar"
import { Footer } from "@/components/landing/footer"
import { pageMetadata } from "@/lib/site"

export const metadata: Metadata = pageMetadata({
  title: "Changelog",
  description:
    "A public record of Better Space features, improvements, and fixes.",
  path: "/changelog",
})

const releases = [
  {
    version: "v1.7.8",
    date: "2026-11-02",
    label: "Snappier navbar brand character rotation",
    summary:
      "Tuned the dynamic character avatar cycler beside the Better Space brand wordmark to a faster, livelier 3-second interval across all screen sizes.",
    highlights: [
      "Reduced the character logo cycling interval from 8 seconds to a snappy, responsive 3 seconds.",
      "Guaranteed that each cycle rotates to a distinct character without back-to-back duplicate rolls.",
      "Enabled dynamic character cycling across mobile and desktop devices while honoring reduced-motion preferences.",
    ],
  },
  {
    version: "v1.7.7",
    date: "2026-11-02",
    label: "Streamlined live duration & clean landing metrics",
    summary:
      "Consolidated live duration exclusively into the sticky top room header with a solid indicator light, and simplified landing page stats to clean static figures.",
    highlights: [
      "Removed the redundant 'Live for' subheader from the active room stage, keeping duration cleanly anchored in the sticky header pill.",
      "Replaced the pulsing red dot on the live duration pill with a solid, non-distracting status indicator.",
      "Removed animated counters from the landing page, restoring crisp, instant static numbers to the network stats and hero preview.",
    ],
  },
  {
    version: "v1.7.6",
    date: "2026-11-01",
    label: "iPhone frame corner clipping & iOS gesture bar",
    summary:
      "Fixed background backing bleed outside iPhone 18 Pro curved corners, and added authentic iOS Home Indicator gesture bars across phone previews.",
    highlights: [
      "Eliminated rectangular background bleed outside the iPhone 18 Pro bezel art by matching the display corner radius squircle clipping and removing oversized backing margins.",
      "Added the signature iOS Home Indicator gesture bar to iPhone 18 Pro and iPhone Duo Safari previews with authentic safe-area spacing.",
    ],
  },
  {
    version: "v1.7.5",
    date: "2026-11-01",
    label: "Live space duration & mechanical animated counters",
    summary:
      "Active spaces now track and display their live duration in real time with tactile rolling mechanical counters, and the landing page numbers come alive with physics-driven animated counters.",
    highlights: [
      "Added live space duration counters to the active space header and stage overview, rolling elapsed time live using spring-animated split-flap wheel mechanics.",
      "Synchronized space duration tracking in room metadata backed by LiveKit room creation timestamps with automatic backfilling.",
      "Brought the landing page hero live stage to life with real-time live duration counter previews across Mac, Duo, and mobile frames.",
      "Transformed the landing page 'The network, in numbers' section with animated counters that smoothly roll into view as visitors scroll into the section.",
    ],
  },
  {
    version: "v1.7.4",
    date: "2026-11-01",
    label: "SSR-first device previews & buttery 120fps motion",
    summary:
      "Eliminated animation and device preview jitter across Mobile, Mac, and Duo: instant SSR device rendering, zero-re-render compositor scaling, and optimized Duo 3D fold physics.",
    highlights: [
      "Eliminated SSR blank flash and layout shift in device screens by providing pre-calculated SSR default scales and updating transforms directly on the DOM during resize without React re-renders.",
      "Optimized iPhone Duo folding physics by pruning redundant multi-pass blurs to a single balanced pass, reducing DOM node overhead by 50% for buttery 60/120fps dragging.",
      "Added a dedicated, responsive mobile iPhone 18 Pro live preview showcasing Better Space in iOS Safari on handheld screens.",
      "Paused background speaker-switching intervals when preview devices scroll out of view via IntersectionObserver.",
      "Accelerated floating reactions and 3D room deck transforms on the GPU with translate3d compositor matrices.",
    ],
  },
  {
    version: "v1.7.3",
    date: "2026-11-01",
    label: "Mobile performance & fluid 60/120fps motion",
    summary:
      "A comprehensive performance overhaul for mobile devices: zero scroll jitter, 100% GPU-composited animations, instant touch responsiveness, and elimination of background layout churn.",
    highlights: [
      "Eliminated scroll jitter and sudden height shifts on mobile by removing mismatched content-visibility containers across dynamic landing sections.",
      "Switched infinite audio level meters and reactive visualizers to GPU-composited scale transforms, eliminating continuous CPU layout reflows.",
      "Optimized 3D foldable iPhone Duo: eliminated 120fps React re-renders during drag/spring physics, hid off-turn blur passes, and enabled hardware compositor layer promotion.",
      "Removed background interval timers: paused off-screen 3D room deck and navbar logo ticks, and deleted an unused 1-second interval in the lobby.",
      "Instant touch responsiveness: added touch-action manipulation to eliminate the 300ms mobile tap delay, removed tap highlight flicker, and enabled async image decoding.",
    ],
  },
  {
    version: "v1.7.2",
    date: "2026-11-01",
    label: "3D receding dot grid & opaque cards",
    summary:
      "The landing bento dot grids now feel truly 3D with larger, brighter dots in the centre that recede towards faded edges, and cards floating above them are fully opaque.",
    highlights: [
      "A mathematically scaled SVG dot grid gives feature cards authentic 3D depth, with larger, brighter dots at the centre that smoothly shrink and fade towards the borders.",
      "Fixed transparency on the first pillar (Persona & name identity form) and moderation panel by wrapping them in solid card containers so background dots do not show through.",
      "Removed translucency from stats cells and crowd avatars for clean contrast against the receding dot backdrop.",
    ],
  },
  {
    version: "v1.7.1",
    date: "2026-10-28",
    label: "Host security fix",
    summary:
      "A listener could read a space's host key and take over as host. The key is no longer visible to anyone in the room.",
    highlights: [
      "Spaces keep only a keyed hash of the host key, checked on the server, so listeners can no longer read it and act as host.",
      "Spaces live during the update get a new host key the next time their host joins.",
    ],
  },
  {
    version: "v1.7.0",
    date: "2026-10-27",
    label: "A new lobby",
    summary:
      "The lobby is redesigned to match the landing page, and launching or joining a space happens in one panel that shows your room's card as you type.",
    highlights: [
      "Launch space and Join open the same panel: the form beside a live preview of the room's card, a centred panel on desktop and a bottom sheet on phones.",
      "Templates, the hero's Go live and shared room links all open that panel, filled in. A template fills its exact name, and any edit makes it a room of your own.",
      "The separate join page is gone, buttons are rounded rectangles instead of pills, and the iPhone Duo on the landing page shows Better Space open in Safari.",
    ],
  },
  {
    version: "v1.6.0",
    date: "2026-10-27",
    label: "iPhone Duo support",
    summary:
      "Better Space now supports iPhone Duo, and the landing page shows a live room on Apple's own device frames, with a Duo you can fold and unfold.",
    highlights: [
      "Rooms adapt to iPhone Duo: on the cover screen and unfolded, the controls stand as a column of round buttons at the bottom right, and unfolded the room splits at the hinge, the space on the left and chat on the right.",
      "The landing page shows the room on a MacBook Pro M5 and an iPhone 18 Pro in Apple's frames, plus an iPhone Duo that folds and unfolds by drag, tap or slider, its screens blurring as the cover turns.",
      "The hero's room-name field sits on one row with Go live on phones, as it does on desktop, and the device previews use the room's real chat bubbles and message box.",
    ],
  },
  {
    version: "v1.5.0",
    date: "2026-09-11",
    label: "Live Chat and Data Synchronization",
    summary:
      "Added real-time messaging, smart typing indicators, and peer-to-peer chat history synchronization powered by LiveKit Data Channels.",
    highlights: [
      "Added live chat functionality with responsive message layouts.",
      "Added smart typing indicators and interactive mobile chat badges with fluid iOS-style CSS animations.",
      "Implemented seamless peer-to-peer chat history synchronization from host to new participants.",
    ],
  },
  {
    version: "v1.4.0",
    date: "2026-09-01",
    label: "Telemetry UI polish & micro-interactions",
    summary:
      "The landing page's stats section got a massive upgrade with hardware-accelerated spring animations, interactive spotlights, and a vibrant pastel palette.",
    highlights: [
      "Replaced monochrome charts with a cohesive pastel color system.",
      "Added fluid, physics-based spring hover spotlights that track mouse position.",
      "Numbers and sparklines now animate smoothly into view dynamically as you scroll.",
    ],
  },
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
    summary: "Better Space became more dependable across devices and links.",
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
            <p className="font-mono text-[11px] font-bold tracking-[0.22em] text-muted-foreground uppercase">
              Changelog
            </p>
            <h1 className="mt-4 font-display text-4xl leading-[1.02] font-extrabold tracking-[-0.04em] sm:text-6xl">
              What shipped,
              <span className="block font-serif-display font-normal text-muted-foreground italic">
                and when.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">
              Every release of Better Space — features, improvements, and fixes.{" "}
              {releases.length} releases so far.
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
                    <span className="shrink-0 rounded-full border border-border px-2 py-0.5 font-mono text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
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
                  className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wider text-muted-foreground uppercase transition-colors hover:text-foreground"
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
              className="inline-flex w-fit items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 font-mono text-[11px] font-bold tracking-wider text-background uppercase transition-colors hover:bg-foreground/90"
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
