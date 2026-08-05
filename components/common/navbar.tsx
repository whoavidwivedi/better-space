"use client"

import Link from "next/link"
import React from "react"
import { RiArrowRightLine } from "@remixicon/react"
import { ModeToggle } from "@/components/common/mode-toggle"
import { DoodleSparkle } from "@/components/common/doodles"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Typographic Minimal Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-display text-xl sm:text-2xl font-black tracking-tight text-foreground">
            better<span className="font-serif-display italic font-normal ml-0.5">space</span>
          </span>
          <DoodleSparkle className="size-4 text-foreground opacity-60 group-hover:opacity-100 transition-opacity" />
        </Link>

        {/* Right Nav Actions */}
        <div className="flex items-center gap-3">
          <ModeToggle />

          <Link
            href="/lobby"
            className="inline-flex h-9 items-center gap-2 rounded-full bg-foreground text-background px-4 font-mono text-xs font-bold tracking-wider transition-opacity hover:opacity-90"
          >
            <span>Lobby</span>
            <RiArrowRightLine size={14} />
          </Link>
        </div>
      </div>
    </header>
  )
}
