/* eslint-disable @next/next/no-img-element */
"use client"

import {
  RiCheckLine,
  RiCloseLine,
  RiDiceLine,
  RiLockLine,
  RiSearchLine,
  RiUserSmileLine,
} from "@remixicon/react"
import React, { useMemo, useState } from "react"

import { AVATAR_PRESETS, getAvatarUrl } from "@/lib/avatars"
import { cn } from "@/lib/utils"

interface AvatarPickerProps {
  selectedAvatar: string
  onSelectAvatar: (avatar: string) => void
  isLocked?: boolean
  className?: string
}

export function AvatarPicker({
  selectedAvatar,
  onSelectAvatar,
  isLocked = false,
  className,
}: AvatarPickerProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const trimmedQuery = searchQuery.trim()

  const filteredPresets = useMemo(() => {
    const q = trimmedQuery.toLowerCase()
    if (!q) return AVATAR_PRESETS
    return AVATAR_PRESETS.filter((name) => name.toLowerCase().includes(q))
  }, [trimmedQuery])

  const hasExactMatch = useMemo(() => {
    if (!trimmedQuery) return true
    return AVATAR_PRESETS.some(
      (name) => name.toLowerCase() === trimmedQuery.toLowerCase()
    )
  }, [trimmedQuery])

  const handleRandomize = () => {
    if (isLocked) return
    const others = AVATAR_PRESETS.filter((name) => name !== selectedAvatar)
    const random =
      others[Math.floor(Math.random() * others.length)] || AVATAR_PRESETS[0]
    onSelectAvatar(random)
  }

  if (isLocked) {
    return (
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-lg border border-border/70 bg-muted/40 p-2 shadow-2xs",
          className
        )}
      >
        <div className="relative size-9 shrink-0 overflow-hidden rounded-full border-2 border-primary/60 bg-card shadow-xs ring-1 ring-primary/20">
          <img
            src={getAvatarUrl(selectedAvatar)}
            alt={selectedAvatar}
            className="size-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <span>{selectedAvatar}</span>
            <span className="py-0.2 inline-flex items-center gap-0.5 rounded border border-primary/20 bg-primary/10 px-1 text-[9px] font-medium text-primary">
              <RiLockLine className="size-2.5" /> Locked
            </span>
          </div>
          <p className="text-[10px] leading-tight text-muted-foreground">
            Permanent identity for this space.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Featured Selected Character Header */}
      <div className="flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-card p-2 shadow-2xs">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <div className="relative size-9 shrink-0 overflow-hidden rounded-full border-2 border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20">
            <img
              src={getAvatarUrl(selectedAvatar)}
              alt={selectedAvatar}
              className="size-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-foreground">
              {selectedAvatar}
            </span>
            <p className="text-[10px] leading-tight text-muted-foreground">
              Permanent identity for this space
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRandomize}
          title="Randomize character"
          className="inline-flex h-7 shrink-0 cursor-pointer items-center gap-1 rounded-md border border-border bg-muted/60 px-2 text-[11px] font-medium text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary active:scale-95"
        >
          <RiDiceLine className="size-3.5" />
          <span>Shuffle</span>
        </button>
      </div>

      {/* Search Bar & Counter */}
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <RiSearchLine className="pointer-events-none absolute top-1/2 left-2 size-3 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search characters or custom..."
            className="h-7 w-full rounded-md border border-border bg-muted/30 pr-6 pl-7 text-[11px] transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute top-1/2 right-1.5 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
            >
              <RiCloseLine className="size-3" />
            </button>
          )}
        </div>
        <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
          {filteredPresets.length}/{AVATAR_PRESETS.length}
        </span>
      </div>

      {/* Character Grid */}
      <div className="relative rounded-lg border border-border/80 bg-muted/20 p-1.5 shadow-inner">
        <div className="grid max-h-32 grid-cols-6 gap-1.5 overflow-y-auto overscroll-contain p-1 pr-1.5">
          {/* Custom Seed Option if typing custom character */}
          {trimmedQuery && !hasExactMatch && (
            <button
              type="button"
              title={`Custom: ${trimmedQuery}`}
              onClick={() => onSelectAvatar(trimmedQuery)}
              className={cn(
                "group relative aspect-square cursor-pointer overflow-visible rounded-full border-2 border-dashed transition-all duration-150 ease-out focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
                selectedAvatar.toLowerCase() === trimmedQuery.toLowerCase()
                  ? "ring-1.5 border-primary bg-primary/10 shadow-xs ring-primary"
                  : "border-primary/60 bg-primary/5 hover:border-primary"
              )}
            >
              <div className="size-full overflow-hidden rounded-full">
                <img
                  src={getAvatarUrl(trimmedQuery)}
                  alt={trimmedQuery}
                  className="pointer-events-none size-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-primary/90 py-0.5 text-center text-[6px] leading-none font-bold text-primary-foreground">
                  Custom
                </div>
              </div>
              {selectedAvatar.toLowerCase() === trimmedQuery.toLowerCase() && (
                <div className="absolute -right-0.5 -bottom-0.5 z-10 flex size-3.5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs ring-1 ring-background">
                  <RiCheckLine className="size-2.5 stroke-[3]" />
                </div>
              )}
            </button>
          )}

          {filteredPresets.map((preset) => {
            const isSelected =
              selectedAvatar.toLowerCase() === preset.toLowerCase()
            return (
              <button
                key={preset}
                type="button"
                title={preset}
                onClick={() => onSelectAvatar(preset)}
                className={cn(
                  "group relative aspect-square cursor-pointer overflow-visible rounded-full border-2 transition-all duration-150 ease-out focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
                  isSelected
                    ? "ring-1.5 border-primary bg-primary/10 shadow-xs ring-primary"
                    : "border-border/70 bg-card opacity-85 hover:border-primary/60 hover:opacity-100"
                )}
              >
                <div className="size-full overflow-hidden rounded-full">
                  <img
                    src={getAvatarUrl(preset)}
                    alt={preset}
                    className="pointer-events-none size-full object-cover"
                    loading="lazy"
                  />
                </div>
                {isSelected && (
                  <div className="absolute -right-0.5 -bottom-0.5 z-10 flex size-3.5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs ring-1 ring-background">
                    <RiCheckLine className="size-2.5 stroke-[3]" />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {filteredPresets.length === 0 && !trimmedQuery && (
          <div className="flex h-24 flex-col items-center justify-center text-center">
            <RiUserSmileLine className="mb-1 size-5 text-muted-foreground/60" />
            <p className="text-[11px] font-medium text-foreground">
              No characters found
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
