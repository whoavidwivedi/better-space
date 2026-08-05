/* eslint-disable @next/next/no-img-element */
"use client"

import React from "react"
import Link from "next/link"
import {
  RiGithubFill,
  RiTwitterXFill,
  RiShieldCheckLine,
  RiSpeedLine,
  RiVolumeUpLine,
  RiPulseLine,
  RiArrowRightLine,
} from "@remixicon/react"

export function Footer() {
  return (
    <footer className="relative w-full border-t border-border bg-card/60 backdrop-blur-md">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-8 sm:pb-12">
        {/* Studio Columns Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 pb-12 sm:pb-16 border-b border-border/70">
          {/* Column 1: Brand & Specs */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative size-9 rounded-full overflow-hidden border border-border bg-muted shrink-0 shadow-xs">
                <img
                  src="/Userpics/SVG/Circle/OSLO-1.svg"
                  alt="Better Space Logo"
                  className="size-full object-cover"
                />
              </div>
              <span className="font-display font-bold text-base tracking-tight text-foreground">
                Better Space
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-normal">
              Ephemeral spatial audio rooms in your browser. Built for spontaneous dialogues and high-bandwidth thought.
            </p>
            <div className="pt-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[10px] font-mono font-medium text-foreground">
                <span className="size-1.5 rounded-full bg-foreground inline-block shrink-0" />
                <span>WebRTC SFU Operational</span>
              </div>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
              Experience
            </h4>
            <ul className="space-y-2 text-xs font-mono text-muted-foreground">
              <li>
                <Link href="/lobby" className="hover:text-foreground transition-colors inline-block py-0.5">
                  Live Rooms Lobby
                </Link>
              </li>
              <li>
                <Link href="/space/design-crit" className="hover:text-foreground transition-colors inline-block py-0.5">
                  Design &amp; Crit Room
                </Link>
              </li>
              <li>
                <Link href="/space/tech-pulse" className="hover:text-foreground transition-colors inline-block py-0.5">
                  Tech Pulse Space
                </Link>
              </li>
              <li>
                <Link href="/space/chill-lounge" className="hover:text-foreground transition-colors inline-block py-0.5">
                  Open Coffee Lounge
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Tech Architecture */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
              Architecture
            </h4>
            <ul className="space-y-2 text-xs font-mono text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <RiSpeedLine size={13} className="shrink-0 text-foreground" />
                <span>Sub-35ms WebRTC</span>
              </li>
              <li className="flex items-center gap-1.5">
                <RiShieldCheckLine size={13} className="shrink-0 text-foreground" />
                <span>Zero Telemetry</span>
              </li>
              <li className="flex items-center gap-1.5">
                <RiVolumeUpLine size={13} className="shrink-0 text-foreground" />
                <span>Opus 48kHz Audio</span>
              </li>
              <li className="flex items-center gap-1.5">
                <RiPulseLine size={13} className="shrink-0 text-foreground" />
                <span>Auto Echo Cancel</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Shortcuts & Controls */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
              Shortcuts
            </h4>
            <ul className="space-y-2 text-xs font-mono text-muted-foreground">
              <li className="flex items-center justify-between">
                <span>Toggle Mic</span>
                <kbd className="rounded border border-border bg-muted/60 px-1.5 py-0.5 text-[10px] text-foreground font-semibold">
                  ⌘ + D
                </kbd>
              </li>
              <li className="flex items-center justify-between">
                <span>Toggle Deafen</span>
                <kbd className="rounded border border-border bg-muted/60 px-1.5 py-0.5 text-[10px] text-foreground font-semibold">
                  ⌘ + E
                </kbd>
              </li>
              <li className="flex items-center justify-between">
                <span>Reactions</span>
                <span className="text-[10px] text-muted-foreground">Top-Right Badge</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Stage Roles</span>
                <span className="text-[10px] text-muted-foreground">Host &amp; Co-Host</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Oversized Typographic Watermark - 100% responsive on all screen sizes */}
        <div className="w-full py-6 sm:py-10 md:py-14 select-none pointer-events-none opacity-20 dark:opacity-25 flex items-center justify-center overflow-hidden">
          <svg
            viewBox="0 0 1100 130"
            className="w-full h-auto max-w-full"
            aria-hidden="true"
          >
            <text
              x="50%"
              y="58%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-current text-foreground font-display font-black tracking-[0.25em]"
              style={{ fontSize: "105px" }}
            >
              BETTER SPACE
            </text>
          </svg>
        </div>

        {/* Bottom Colophon Bar */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-muted-foreground text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1">
            <span>&copy; {new Date().getFullYear()} Better Space.</span>
            <span className="hidden sm:inline">•</span>
            <span>100% Ephemeral Voice.</span>
            <span className="hidden sm:inline">•</span>
            <span>Zero Tracking.</span>
          </div>

          <div className="flex items-center gap-4 text-muted-foreground">
            <Link href="/lobby" className="hover:text-foreground transition-colors">
              Lobby
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub Source"
              className="hover:text-foreground transition-colors p-1"
            >
              <RiGithubFill size={16} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              aria-label="X / Twitter"
              className="hover:text-foreground transition-colors p-1"
            >
              <RiTwitterXFill size={15} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
