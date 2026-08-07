/* eslint-disable @next/next/no-img-element */
"use client"

import {
  RiShuffleLine,
  RiCheckLine,
  RiUser3Line,
  RiEditLine,
} from "@remixicon/react"
import { useState, useRef, useMemo } from "react"

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Bend } from "@/components/canvasui/Bend"
import { cn } from "@/lib/utils"
import {
  CHARACTER_COLLECTIONS,
  USERPIC_NAMES,
  userpicUrl,
  randomUserpic,
  getCharacterCollection,
} from "@/lib/userpics"

export function CharacterPicker({
  value,
  onSelect,
  size = "sm",
  trigger,
  open: openProp,
  onOpenChange,
}: {
  value: string
  onSelect: (seed: string) => void
  size?: "sm" | "md" | "lg"
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = openProp ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  const [selectedCol, setSelectedCol] = useState("all")
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const pillsRef = useRef<HTMLDivElement>(null)

  const handlePillsScroll = () => {
    const el = pillsRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1)
  }

  const buttonSize =
    size === "lg" ? "size-9" : size === "md" ? "size-8" : "size-7"
  const iconSize =
    size === "lg" ? "size-4" : size === "md" ? "size-3.5" : "size-3"

  const activeCollection = getCharacterCollection(value)

  const filtered = useMemo(() => {
    return (
      CHARACTER_COLLECTIONS.find((c) => c.id === selectedCol)?.characters ??
      USERPIC_NAMES
    )
  }, [selectedCol])

  const handleSelect = (name: string) => {
    onSelect(name)
    setOpen(false)
  }

  const handleRandomize = () => {
    const random = randomUserpic()
    onSelect(random)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          trigger ? (
            (trigger as React.ReactElement)
          ) : (
            <button
              type="button"
              aria-label="Change avatar persona"
              title="Change avatar persona"
              className={cn(
                "absolute -right-1 -bottom-1 z-10 flex cursor-pointer items-center justify-center rounded-full border-2 border-background bg-foreground text-background shadow-md transition-all duration-150 hover:scale-110 focus:ring-2 focus:ring-foreground focus:ring-offset-1 focus:outline-none active:scale-95",
                buttonSize
              )}
            >
              <RiEditLine className={iconSize} />
            </button>
          )
        }
      />
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={8}
        className="w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-border bg-card p-0 shadow-2xl sm:w-[min(28rem,calc(100vw-2rem))] sm:rounded-3xl"
      >
        <div className="flex flex-col">
          {/* Header */}
          <PopoverHeader className="border-b border-border/70 px-4 pt-4 pb-3 sm:px-5 sm:pt-5">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-muted sm:size-8">
                <RiUser3Line size={14} className="text-foreground" />
              </div>
              <div className="min-w-0">
                <PopoverTitle className="font-display text-sm leading-tight font-bold text-foreground sm:text-base">
                  Choose Persona
                </PopoverTitle>
                <PopoverDescription className="truncate font-mono text-[10px] text-muted-foreground sm:text-[11px]">
                  {activeCollection.name} &middot; {activeCollection.tagline}
                </PopoverDescription>
              </div>
            </div>
          </PopoverHeader>

          <div className="flex flex-col gap-3 p-4 sm:p-5">
            {/* Category Pills */}
            <div className="relative -mx-0.5 flex-1">
              <div
                ref={pillsRef}
                onScroll={handlePillsScroll}
                className="flex scrollbar-none items-center gap-1 overflow-x-auto px-0.5 pb-0.5"
              >
                {CHARACTER_COLLECTIONS.map((col) => {
                  const isActive = selectedCol === col.id
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setSelectedCol(col.id)}
                      className={cn(
                        "shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold whitespace-nowrap transition-all active:scale-95 sm:text-[11px]",
                        isActive
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {col.name.split(" ")[0]}
                    </button>
                  )
                })}
              </div>
              {canScrollLeft && (
                <div className="pointer-events-none absolute top-0 bottom-0.5 left-0 w-4 bg-gradient-to-r from-card to-transparent" />
              )}
              {canScrollRight && (
                <div className="pointer-events-none absolute top-0 right-0 bottom-0.5 w-4 bg-gradient-to-l from-card to-transparent" />
              )}
            </div>

            {/* Avatar Grid */}
            <Bend
              className="-mx-0.5 h-52 sm:h-60"
              zone={240}
              angle={80}
              rounding={150}
              perspective={700}
              ease={240}
              smoothing={0.1}
              tumble={0.5}
              tilt={0.5}
              direction="in"
              top
              bottom
            >
              <div className="grid grid-cols-4 gap-1.5 px-0.5 py-0.5 sm:grid-cols-5 sm:gap-2">
                {filtered.map((name) => {
                  const isSelected = value === name
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleSelect(name)}
                      aria-label={name}
                      aria-pressed={isSelected}
                      className="group relative flex items-center justify-center rounded-xl p-0.5 transition-all hover:bg-muted/40 focus:outline-none active:scale-95"
                    >
                      <div className="relative size-12 sm:size-13">
                        <img
                          src={userpicUrl(name)}
                          alt={name}
                          className={cn(
                            "size-full rounded-full border-2 bg-muted object-cover",
                            isSelected
                              ? "border-foreground"
                              : "border-border/80 group-hover:border-foreground/60"
                          )}
                        />
                        {isSelected && (
                          <div className="absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full border-2 border-card bg-foreground text-background shadow-xs sm:size-5">
                            <RiCheckLine size={10} className="stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </Bend>
          </div>

          {/* Selected Persona Footer */}
          <div className="flex items-center justify-between gap-3 border-t border-border/70 bg-muted/30 px-4 py-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-2.5">
              <img
                src={userpicUrl(value)}
                alt=""
                className="size-8 shrink-0 rounded-full border border-border bg-background sm:size-9"
              />
              <div className="min-w-0">
                <p className="truncate font-mono text-xs font-bold text-foreground">
                  {value}
                </p>
                <p className="truncate font-mono text-[10px] text-muted-foreground">
                  {activeCollection.name}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRandomize}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-foreground px-2.5 py-1.5 font-mono text-[10px] font-bold text-background transition-all hover:opacity-90 active:scale-95 sm:text-[11px]"
              title="Pick a random persona"
            >
              <RiShuffleLine size={12} />
              Surprise me
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
