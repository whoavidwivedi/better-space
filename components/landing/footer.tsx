import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { SiteLogo } from "@/components/common/site-logo"

const socials = [
  { label: "Website", href: "https://whoavidwivedi.work" },
  { label: "GitHub", href: "https://github.com/whoavidwivedi" },
  { label: "X", href: "https://x.com/whoavidwivedi" },
  { label: "LinkedIn", href: "https://linkedin.com/in/whoavidwivedi" },
]

const productLinks = [
  { label: "Launch a space", href: "/" },
  { label: "Lobby", href: "/lobby" },
  { label: "Changelog", href: "/changelog" },
]

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] font-bold tracking-[0.22em] text-muted-foreground uppercase">
      {children}
    </p>
  )
}

const footerLinkClass =
  "text-sm text-muted-foreground transition-colors hover:text-foreground"

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="relative w-full overflow-hidden border-t border-border bg-card/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Top: brand blurb + link columns */}
        <div className="grid gap-10 pt-12 pb-10 sm:pb-12 md:grid-cols-[1fr_auto] md:gap-20">
          <div>
            <Link
              href="/"
              className="group flex w-fit items-center gap-2.5 outline-none"
            >
              <SiteLogo className="size-8 transition-transform duration-300 group-hover:scale-110" />
              <span className="font-google-sans text-base font-black tracking-tight text-foreground">
                better
                <span className="ml-0.5 font-serif-display font-normal text-muted-foreground italic">
                  space
                </span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
              Low-latency audio rooms you can host in seconds —{" "}
              <span className="font-serif-display italic">
                real voices, no clutter.
              </span>
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-10 sm:gap-20"
          >
            <div>
              <ColumnHeading>Product</ColumnHeading>
              <ul className="mt-4 space-y-2.5">
                {productLinks.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className={footerLinkClass}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <ColumnHeading>Connect</ColumnHeading>
              <ul className="mt-4 space-y-2.5">
                {socials.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className={`inline-flex items-center gap-1 ${footerLinkClass}`}
                    >
                      {label}
                      <ArrowUpRight size={12} aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        {/* Meta bar */}
        <div className="flex flex-col gap-3 border-t border-border/40 py-5 font-mono text-[10px] tracking-wider text-muted-foreground/80 uppercase sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {year} betterspace</span>
          <span className="text-muted-foreground/60">
            Built by{" "}
            <a
              href="https://whoavidwivedi.work"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground/80 transition-colors hover:text-foreground"
            >
              whoavidwivedi
            </a>
          </span>
        </div>
      </div>

      {/* Oversized brand statement */}
      <div
        aria-hidden="true"
        className="pointer-events-none relative -mt-2 select-none"
      >
        <p className="flex animate-pulse flex-wrap items-baseline justify-center gap-x-[0.18em] px-2 font-display [font-size:clamp(3rem,14vw,13rem)] leading-[0.82] font-black tracking-tighter whitespace-nowrap text-foreground/90 [animation-duration:5s] motion-reduce:animate-none">
          BETTER
          <span className="font-serif-display font-normal tracking-normal text-muted-foreground normal-case italic">
            space
          </span>
        </p>
        <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>
    </footer>
  )
}
