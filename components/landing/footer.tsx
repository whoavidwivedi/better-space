/* eslint-disable @next/next/no-img-element */
"use client"

import React from "react"
import Link from "next/link"
import { RiRadio2Line, RiGithubFill, RiTwitterXFill, RiHeartLine } from "@remixicon/react"

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card/40 py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6 text-center sm:text-left">
          {/* Logo & Info */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background font-mono text-sm font-bold shrink-0">
              B
            </div>
            <div>
              <span className="font-display font-bold text-sm tracking-tight text-foreground block">
                Better Space
              </span>
              <span className="font-mono text-xs text-muted-foreground block">
                Ephemeral spatial audio rooms in your browser
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-6 font-mono text-xs text-muted-foreground">
            <Link href="/lobby" className="hover:text-foreground transition-colors py-1">
              Live Lobby
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors py-1"
            >
              Source
            </a>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 font-mono text-[10px] sm:text-[11px] text-muted-foreground text-center sm:text-left">
          <span>&copy; {new Date().getFullYear()} Better Space. Zero telemetry.</span>
          <span>Designed with high craft &amp; meaningful minimalism.</span>
        </div>
      </div>
    </footer>
  )
}
