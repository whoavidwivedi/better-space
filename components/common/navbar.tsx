/* eslint-disable @next/next/no-img-element */
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import React, { useState, useEffect } from "react"
import { RiArrowRightLine, RiArrowLeftLine } from "@remixicon/react"
import { ModeToggle } from "@/components/common/mode-toggle"
import { randomUserpic, userpicUrl } from "@/lib/userpics"
import { getDisplayRoomTitle } from "@/lib/presets"

export function Navbar() {
  const pathname = usePathname()
  const isLobby = pathname === "/lobby"
  const isSpace = pathname.startsWith("/space/")
  const spaceParam = isSpace ? pathname.replace(/^\/space\//, "") : ""
  const roomTitle = spaceParam ? getDisplayRoomTitle(spaceParam) : ""
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
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 gap-3">
        {/* Dynamic Character Circle Logo & Wordmark + Room Title Badge */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-2.5 focus:outline-none shrink-0"
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

          {isSpace && roomTitle && (
            <div className="flex items-center gap-1.5 pl-2.5 sm:pl-3 border-l border-border min-w-0">
              <span className="font-display text-xs sm:text-sm font-bold text-foreground truncate max-w-[140px] sm:max-w-xs md:max-w-md">
                {roomTitle}
              </span>
            </div>
          )}
        </div>

        {/* Right Nav Actions */}
        <div className="flex items-center gap-3 shrink-0">
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
