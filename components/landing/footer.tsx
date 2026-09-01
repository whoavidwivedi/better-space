"use client"

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
  { label: "Lobby", href: "/lobby" },
  { label: "Changelog", href: "/changelog" },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-border bg-background">
      <div className="mx-auto max-w-7xl">
        {/* Top Massive CTA */}
        <div className="flex flex-col items-center justify-between gap-8 border-b border-border px-6 py-16 sm:flex-row sm:px-12 sm:py-24">
          <div className="text-center sm:text-left">
            <h2 className="font-display text-4xl leading-none font-black tracking-tight text-foreground sm:text-5xl">
              Ready to{" "}
              <span className="font-serif-display font-normal text-muted-foreground italic">
                broadcast?
              </span>
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Low-latency audio rooms you can spin up in seconds.
            </p>
          </div>
          <Link
            href="/"
            className="group relative inline-flex h-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-foreground px-8 font-mono text-[10px] font-bold tracking-[0.2em] text-background uppercase transition-transform active:scale-95"
          >
            <span className="relative z-10">Launch a Space</span>
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#93c5fd] to-[#c4b5fd] opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
          </Link>
        </div>

        {/* Structural Grid */}
        <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {/* Brand & Status Column */}
          <div className="flex flex-col justify-between p-6 sm:p-12">
            <div>
              <Link href="/" className="flex w-fit items-center gap-2">
                <SiteLogo className="size-6" />
                <span className="font-google-sans text-lg font-black tracking-tight text-foreground">
                  better
                  <span className="ml-0.5 font-serif-display font-normal text-muted-foreground italic">
                    space
                  </span>
                </span>
              </Link>
              <p className="mt-4 max-w-xs text-xs leading-5 text-muted-foreground">
                Real voices, no clutter. We sweat the network details so you can
                just talk.
              </p>
            </div>

            <div className="mt-12 flex items-center gap-3">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6ee7b7] opacity-75"></span>
                <span className="relative inline-flex size-2 rounded-full bg-[#34d399]"></span>
              </span>
              <span className="font-mono text-[9px] font-bold tracking-[0.1em] text-muted-foreground uppercase">
                Systems Operational
              </span>
            </div>
          </div>

          {/* Product Links */}
          <div className="p-6 sm:p-12">
            <h3 className="font-mono text-[10px] font-bold tracking-[0.2em] text-foreground uppercase">
              Product
            </h3>
            <ul className="mt-8 space-y-4">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-mono text-[11px] font-bold tracking-wider text-muted-foreground uppercase transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect Links */}
          <div className="p-6 sm:p-12">
            <h3 className="font-mono text-[10px] font-bold tracking-[0.2em] text-foreground uppercase">
              Connect
            </h3>
            <ul className="mt-8 space-y-4">
              {socials.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex w-fit items-center gap-1.5 font-mono text-[11px] font-bold tracking-wider text-muted-foreground uppercase transition-colors hover:text-foreground"
                  >
                    {link.label}
                    <ArrowUpRight
                      size={12}
                      className="opacity-40 transition-opacity group-hover:opacity-100"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border bg-muted/20 px-6 py-6 sm:px-12">
          <p className="text-center font-mono text-[10px] tracking-widest text-muted-foreground/60 uppercase">
            &copy; {year} betterspace • Built by whoavidwivedi
          </p>
        </div>
      </div>
    </footer>
  )
}
