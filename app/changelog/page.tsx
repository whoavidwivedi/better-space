import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowUpRight as RiArrowUpRightLine,
  GitCommitHorizontal as RiGitCommitLine,
  Layers3 as RiLayersLine,
  ShieldCheck as RiShieldCheckLine,
  Sparkles as RiSparklesLine,
} from "lucide-react"

import { Navbar } from "@/components/common/navbar"
import { Footer } from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "A public record of Better Space features, improvements, and security work.",
  alternates: { canonical: "/changelog" },
}

const releases = [
  {
    version: "v1.3.5",
    date: "2026-08-21",
    label: "Vercel deployment stability",
    summary:
      "Pinned the Vercel build to a stable Bun runtime after the previous runtime crashed after a successful build.",
    highlights: [
      "Pinned Vercel install and build commands to Bun 1.3.1.",
      "Kept the build pipeline Bun-only from dependency install through production build.",
      "Verified the Vercel-style build command locally with all routes generated.",
    ],
    tone: "security",
  },
  {
    version: "v1.3.4",
    date: "2026-08-21",
    label: "Dependency security hardening",
    summary:
      "Updated the framework and dependency graph, then pinned patched transitive packages so the production install is audit-clean.",
    highlights: [
      "Updated Next.js and its lint integration to patched releases.",
      "Added Bun dependency overrides for vulnerable transitive packages.",
      "Verified a clean high-severity vulnerability audit with a frozen lockfile.",
    ],
    tone: "security",
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
    tone: "latest",
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
      "Verified focus behavior at a 390 × 844 mobile viewport.",
    ],
    tone: "latest",
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
      "Added regression coverage for promotion and revocation boundaries.",
    ],
    tone: "security",
  },
  {
    version: "v1.3.0",
    date: "2026-08-21",
    label: "Cohost controls & secure moderation",
    summary:
      "Hosts can now share the room workload without sharing authority, with cohost moderation and end-space controls.",
    highlights: [
      "Added cohost promotion, revocation, and end-space controls.",
      "Moved moderation authorization to the server boundary.",
      "Encrypted cohost secrets and added access validation tests.",
    ],
    tone: "security",
  },
  {
    version: "v1.2.1",
    date: "2026-08-14",
    label: "Footer, documentation & brand polish",
    summary:
      "The public surface got a clearer footer, a sharper README, and a more consistent Better Space identity.",
    highlights: [
      "Added direct Website, GitHub, X, and LinkedIn links.",
      "Updated the README to match the current product and stack.",
      "Added a dynamic animated logo asset for project documentation.",
    ],
    tone: "craft",
  },
  {
    version: "v1.2.0",
    date: "2026-08-07",
    label: "Lobby redesign & API security",
    summary:
      "A cleaner monochrome lobby arrived alongside stronger API validation and a fix for browser-visible secrets.",
    highlights: [
      "Migrated interface icons to Lucide and standardized buttons.",
      "Refined lobby cards, footer, hydration, and responsive states.",
      "Hardened API boundaries and removed secret leakage paths.",
    ],
    tone: "security",
  },
  {
    version: "v1.1.0",
    date: "2026-08-07",
    label: "Mobile lobby, room lifecycle & CI",
    summary:
      "Better Space became more dependable across devices, links, and deployments.",
    highlights: [
      "Added responsive lobby and room experiences for mobile and tablet.",
      "Added durable ended-space handling to prevent stale links from reviving rooms.",
      "Added GitHub Actions CI, release automation, and Bun-only validation scripts.",
    ],
    tone: "foundation",
  },
  {
    version: "v1.0.2",
    date: "2026-08-04",
    label: "Avatar fixes & security hardening",
    summary:
      "Avatars became reliable under load while a set of high-severity dependency advisories was closed.",
    highlights: [
      "Reduced avatar picker request pressure and fixed blank avatar states.",
      "Updated Next.js dependencies to address SSRF, bypass, and DoS advisories.",
      "Bumped the PWA cache and respected reduced-motion preferences.",
    ],
    tone: "security",
  },
  {
    version: "v1.0.1",
    date: "2026-08-04",
    label: "Release hygiene & hardening",
    summary:
      "The release foundation was tightened for repeatable production delivery.",
    highlights: [
      "Hardened repository and release hygiene.",
      "Prepared consistent versioned releases and changelog tracking.",
    ],
    tone: "foundation",
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
    tone: "foundation",
  },
] as const

const toneIcons = {
  latest: RiSparklesLine,
  security: RiShieldCheckLine,
  craft: RiLayersLine,
  foundation: RiGitCommitLine,
} as const

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
        <section className="relative overflow-hidden border-b border-border/70">
          <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,color-mix(in_oklab,var(--foreground)_7%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--foreground)_7%,transparent)_1px,transparent_1px)] [background-size:4rem_4rem] opacity-60" />
          <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1fr_20rem] lg:items-end lg:px-8">
            <div>
              <p className="mb-6 font-mono text-[10px] font-bold tracking-[0.28em] text-muted-foreground uppercase">
                Public changelog / 12 releases
              </p>
              <h1 className="max-w-3xl font-display text-5xl leading-[0.94] font-black tracking-[-0.055em] sm:text-7xl">
                Built in public.
                <span className="block font-serif-display font-normal tracking-[-0.035em] text-muted-foreground italic">
                  Made for better rooms.
                </span>
              </h1>
              <p className="mt-8 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                The short version of what has shipped: features, fixes, and the
                security work that keeps every room feeling simple.
              </p>
            </div>

            <div className="relative border-l-2 border-foreground pl-5 sm:pl-6">
              <p className="font-mono text-[10px] font-bold tracking-[0.22em] text-muted-foreground uppercase">
                The release signal
              </p>
              <p className="mt-3 font-display text-2xl leading-tight font-bold tracking-tight">
                From first room to cohost control.
              </p>
              <Link
                href="https://github.com/whoavidwivedi/better-space/releases"
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-wider text-foreground uppercase underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
              >
                View releases on GitHub
                <RiArrowUpRightLine size={13} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-border border-b border-border px-4 sm:px-6 lg:px-8">
          {[
            ["12", "published releases"],
            ["03", "security milestones"],
            ["∞", "rooms to come"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="px-3 py-6 first:pl-0 last:pr-0 sm:px-6 sm:py-8"
            >
              <p className="font-display text-2xl font-black tracking-tight sm:text-3xl">
                {value}
              </p>
              <p className="mt-1 font-mono text-[9px] tracking-[0.14em] text-muted-foreground uppercase sm:text-[10px]">
                {label}
              </p>
            </div>
          ))}
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mb-10 flex items-end justify-between gap-4 sm:mb-14">
            <div>
              <p className="font-mono text-[10px] font-bold tracking-[0.22em] text-muted-foreground uppercase">
                Release notes
              </p>
              <h2 className="mt-3 font-display text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                What changed
              </h2>
            </div>
            <span className="hidden font-mono text-[10px] tracking-wider text-muted-foreground uppercase sm:block">
              Newest first
            </span>
          </div>

          <div className="relative">
            <div className="absolute top-3 bottom-3 left-[5px] w-px bg-border sm:left-[7px]" />
            <div className="space-y-12 sm:space-y-16">
              {releases.map((release, index) => {
                const Icon = toneIcons[release.tone]
                const isLatest = index === 0

                return (
                  <article
                    key={release.version}
                    className="relative grid gap-5 pl-8 sm:grid-cols-[8rem_1fr] sm:gap-10 sm:pl-0"
                  >
                    <div className="sm:pt-2 sm:text-right">
                      <time
                        dateTime={release.date}
                        className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase"
                      >
                        {formatReleaseDate(release.date)}
                      </time>
                      <p className="mt-1 font-mono text-xs font-bold tracking-wider text-foreground">
                        {release.version}
                      </p>
                    </div>

                    <div className="relative rounded-2xl border border-border bg-card p-5 shadow-xs transition-[border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-md sm:p-7">
                      <span className="absolute -top-1.5 -left-[31px] flex size-3 items-center justify-center rounded-full border-2 border-background bg-foreground sm:top-8 sm:-left-[51px] sm:size-4">
                        <span className="size-1 rounded-full bg-background sm:size-1.5" />
                      </span>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span
                            className={
                              isLatest
                                ? "flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-background"
                                : "flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground"
                            }
                          >
                            <Icon size={16} aria-hidden="true" />
                          </span>
                          <div>
                            {isLatest && (
                              <p className="mb-1 font-mono text-[9px] font-bold tracking-[0.18em] text-muted-foreground uppercase">
                                Latest release
                              </p>
                            )}
                            <h3 className="font-display text-xl leading-tight font-bold tracking-tight sm:text-2xl">
                              {release.label}
                            </h3>
                          </div>
                        </div>
                        <Link
                          href={`https://github.com/whoavidwivedi/better-space/releases/tag/${release.version}`}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`View ${release.version} on GitHub`}
                          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                        >
                          <RiArrowUpRightLine size={15} aria-hidden="true" />
                        </Link>
                      </div>
                      <p className="mt-5 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                        {release.summary}
                      </p>
                      <ul className="mt-6 grid gap-3 border-t border-border/70 pt-5 text-sm leading-5 text-foreground sm:grid-cols-2">
                        {release.highlights.map((highlight) => (
                          <li key={highlight} className="flex gap-2.5">
                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground/50" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/40">
          <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div>
              <p className="font-display text-xl font-bold tracking-tight">
                Want to see the next one happen?
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Drop into a live room or follow the project on GitHub.
              </p>
            </div>
            <Link
              href="/lobby"
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-foreground px-4 py-3 font-mono text-[10px] font-bold tracking-wider text-background uppercase transition-transform duration-150 ease-out hover:bg-foreground/90 active:scale-[0.98]"
            >
              Explore live spaces
              <RiArrowUpRightLine size={14} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
