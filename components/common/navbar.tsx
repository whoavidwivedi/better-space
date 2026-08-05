/* eslint-disable @next/next/no-img-element */
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import React, { useState, useEffect } from "react"
import { RiArrowRightLine, RiArrowLeftLine } from "@remixicon/react"
import { ModeToggle } from "@/components/common/mode-toggle"
import { randomUserpic, userpicUrl } from "@/lib/userpics"

export function Navbar() {
  const pathname = usePathname()
  const isLobby = pathname === "/lobby"
  const [avatar, setAvatar] = useState("OSLO-1")

  useEffect(() => {
    setAvatar(randomUserpic())

    const interval = setInterval(() => {
      setAvatar(randomUserpic())
    }, 2800)

    return () => clearInterval(interval)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Dynamic Character Circle Logo & Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2.5 focus:outline-none"
        >
          <div className="relative size-8 sm:size-9 rounded-full overflow-hidden border border-border bg-muted shrink-0 shadow-xs">
            <img
              key={avatar}
              src={userpicUrl(avatar)}
              alt="Better Space Character Logo"
              className="size-full object-cover animate-in fade-in zoom-in-95 duration-300"
            />
          </div>
          <span className="font-display text-xl sm:text-2xl font-black tracking-tight text-foreground">
            better<span className="font-serif-display italic font-normal text-muted-foreground ml-0.5">space</span>
          </span>
        </Link>

        {/* Right Nav Actions */}
        <div className="flex items-center gap-3">
          <ModeToggle />

          {isLobby ? (
            <Link
              href="/"
              className="inline-flex h-9 w-24 items-center justify-center gap-1.5 rounded-full bg-foreground text-background font-mono text-xs font-bold tracking-wider transition-opacity hover:opacity-90 active:scale-95 shrink-0"
            >
              <RiArrowLeftLine size={14} />
              <span>Home</span>
            </Link>
          ) : (
            <Link
              href="/lobby"
              className="inline-flex h-9 w-24 items-center justify-center gap-1.5 rounded-full bg-foreground text-background font-mono text-xs font-bold tracking-wider transition-opacity hover:opacity-90 active:scale-95 shrink-0"
            >
              <span>Lobby</span>
              <RiArrowRightLine size={14} />
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
