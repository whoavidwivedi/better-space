"use client"

import Link from "next/link"
import { SiteLogo } from "@/components/common/site-logo"

const socials = [
  { label: "Website", href: "https://whoavidwivedi.work" },
  { label: "GitHub", href: "https://github.com/whoavidwivedi" },
  { label: "X", href: "https://x.com/whoavidwivedi" },
  { label: "LinkedIn", href: "https://linkedin.com/in/whoavidwivedi" },
]

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="w-full border-t border-border bg-card/30">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
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

          {/* Social Links */}
          <div className="flex flex-wrap items-center gap-2">
            {socials.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-border/60 px-3.5 py-1.5 font-mono text-[10px] tracking-wider text-muted-foreground uppercase transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 flex flex-col gap-3 border-t border-border/40 pt-6 font-mono text-[10px] tracking-wider text-muted-foreground/80 uppercase sm:flex-row sm:items-center sm:justify-between">
          <span>
            &copy; {year} betterspace
          </span>
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
    </footer>
  )
}
