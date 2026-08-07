/* eslint-disable @next/next/no-img-element */
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import React, { useState, useEffect } from "react"
import { ModeToggle } from "@/components/common/mode-toggle"
import { randomUserpic, userpicUrl } from "@/lib/userpics"
import { getDisplayRoomTitle } from "@/lib/presets"

export function Navbar() {
  const pathname = usePathname()
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
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Dynamic Character Circle Logo & Wordmark + Room Title Badge */}
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 focus:outline-none"
          >
            <div className="relative size-8 shrink-0 overflow-hidden rounded-full border border-border bg-muted shadow-xs sm:size-9">
              <img
                key={avatar}
                src={userpicUrl(avatar)}
                alt="Better Space Character Logo"
                className="size-full animate-in object-cover duration-300 zoom-in-95 fade-in"
              />
            </div>
            <span className="font-display text-xl font-black tracking-tight text-foreground sm:text-2xl">
              better
              <span className="ml-0.5 font-serif-display font-normal text-muted-foreground italic">
                space
              </span>
            </span>
          </Link>

          {isSpace && roomTitle && (
            <div className="flex min-w-0 items-center gap-1.5 border-l border-border pl-2.5 sm:pl-3">
              <span className="max-w-[140px] truncate font-display text-xs font-bold text-foreground sm:max-w-xs sm:text-sm md:max-w-md">
                {roomTitle}
              </span>
            </div>
          )}
        </div>

        {/* Right Nav Actions */}
        <div className="flex shrink-0 items-center gap-3">
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
