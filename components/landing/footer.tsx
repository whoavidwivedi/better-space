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
              className="flex items-center gap-2.5 outline-none hover:opacity-90 transition-opacity"
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
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span className="text-border/60" aria-hidden="true">
              /
            </span>
            <Link
              href="/lobby"
              className="hover:text-foreground transition-colors"
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
              className="hover:text-foreground transition-colors"
            >
              LiveKit
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-border/40" />

        {/* Bottom copyright & features */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between font-mono text-[9px] text-muted-foreground/80 uppercase tracking-wider">
          <div>
            &copy; {year}{" "}
            <span className="text-foreground font-bold">betterspace</span>
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
