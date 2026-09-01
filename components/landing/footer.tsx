"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

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

function HoverLink({
  label,
  href,
  isExternal,
  hovered,
  setHovered,
}: {
  label: string
  href: string
  isExternal?: boolean
  hovered: string | null
  setHovered: (v: string | null) => void
}) {
  const isHovered = hovered === label

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setHovered(label)}
      onMouseLeave={() => setHovered(null)}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            layoutId="footer-hover-pill"
            className="absolute -inset-x-3 -inset-y-1.5 rounded-md bg-muted/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
      </AnimatePresence>

      {isExternal ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="relative z-10 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {label}
          <ArrowUpRight size={12} aria-hidden="true" />
        </a>
      ) : (
        <Link
          href={href}
          className="relative z-10 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {label}
        </Link>
      )}
    </div>
  )
}

export function Footer() {
  const year = new Date().getFullYear()
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)

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
              <ul className="mt-5 space-y-4">
                {productLinks.map(({ label, href }) => (
                  <li key={label}>
                    <HoverLink
                      label={label}
                      href={href}
                      hovered={hoveredLink}
                      setHovered={setHoveredLink}
                    />
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <ColumnHeading>Connect</ColumnHeading>
              <ul className="mt-5 space-y-4">
                {socials.map(({ label, href }) => (
                  <li key={label}>
                    <HoverLink
                      label={label}
                      href={href}
                      isExternal
                      hovered={hoveredLink}
                      setHovered={setHoveredLink}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        {/* Meta bar */}
        <div className="flex flex-col gap-3 border-t border-border/40 py-6 font-mono text-[10px] tracking-wider text-muted-foreground/80 uppercase sm:flex-row sm:items-center sm:justify-between">
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

      {/* Network Status & Soundwave Deck */}
      <div className="border-t border-border/60 bg-muted/20">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6ee7b7] opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-[#34d399]"></span>
            </span>
            <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
              Systems Operational • Latency &lt; 50ms
            </span>
          </div>

          <div
            className="flex h-4 items-center gap-1 opacity-50 transition-opacity hover:opacity-100"
            aria-hidden="true"
          >
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <motion.div
                key={i}
                className="w-1 rounded-full bg-[#93c5fd]"
                animate={{ height: ["4px", "16px", "4px"] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
