/* eslint-disable @next/next/no-img-element */
"use client"

import Link from "next/link"
import { SiteLogo } from "@/components/common/site-logo"

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="w-full border-t border-border bg-card/30 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 transition-opacity outline-none hover:opacity-90"
            >
              <SiteLogo className="size-7.5" />
              <span className="font-google-sans text-sm font-black tracking-tight text-foreground">
                better
                <span className="ml-0.5 font-serif-display font-normal text-muted-foreground italic">
                  space
                </span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
            <Link href="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
            <span className="text-border/60" aria-hidden="true">
              /
            </span>
            <Link
              href="/lobby"
              className="transition-colors hover:text-foreground"
            >
              Lobby
            </Link>
            <span className="text-border/60" aria-hidden="true">
              /
            </span>
            <a
              href="https://livekit.io"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-foreground"
            >
              LiveKit
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-border/40" />

        {/* Bottom copyright & features */}
        <div className="flex flex-col gap-3 font-mono text-[9px] tracking-wider text-muted-foreground/80 uppercase sm:flex-row sm:items-center sm:justify-between">
          <div>
            &copy; {year}{" "}
            <span className="font-bold text-foreground">betterspace</span>
          </div>

          <div className="flex items-center gap-2">
            <span>Instant Audio</span>
            <span className="size-1 rounded-full bg-border" />
            <span>End-to-End Privacy</span>
            <span className="size-1 rounded-full bg-border" />
            <span>Zero Tracking</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
