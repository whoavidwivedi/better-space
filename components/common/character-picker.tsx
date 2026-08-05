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

  const buttonSize = size === "lg" ? "size-9" : size === "md" ? "size-8" : "size-7"
  const iconSize = size === "lg" ? "size-4" : size === "md" ? "size-3.5" : "size-3"

  const activeCollection = getCharacterCollection(value)

  const filtered = useMemo(() => {
    return CHARACTER_COLLECTIONS.find((c) => c.id === selectedCol)?.characters ?? USERPIC_NAMES
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
                "absolute -right-1 -bottom-1 flex items-center justify-center rounded-full bg-foreground text-background shadow-md border-2 border-background hover:scale-110 active:scale-95 transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-1 z-10",
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
        className="w-[min(22rem,calc(100vw-1.5rem))] sm:w-[min(28rem,calc(100vw-2rem))] overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-card p-0 shadow-2xl"
      >
        <div className="flex flex-col">
          {/* Header */}
          <PopoverHeader className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 border-b border-border/70">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 sm:size-8 items-center justify-center rounded-full bg-muted border border-border shrink-0">
                <RiUser3Line size={14} className="text-foreground" />
              </div>
              <div className="min-w-0">
                <PopoverTitle className="font-display text-sm sm:text-base font-bold text-foreground leading-tight">
                  Choose Persona
                </PopoverTitle>
                <PopoverDescription className="font-mono text-[10px] sm:text-[11px] text-muted-foreground truncate">
                  {activeCollection.name} &middot; {activeCollection.tagline}
                </PopoverDescription>
              </div>
            </div>
          </PopoverHeader>

          <div className="flex flex-col gap-3 p-4 sm:p-5">
            {/* Category Pills */}
            <div className="relative flex-1 -mx-0.5">
              <div
                ref={pillsRef}
                onScroll={handlePillsScroll}
                className="flex items-center gap-1 overflow-x-auto scrollbar-none px-0.5 pb-0.5"
              >
                {CHARACTER_COLLECTIONS.map((col) => {
                  const isActive = selectedCol === col.id
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setSelectedCol(col.id)}
                      className={cn(
                        "whitespace-nowrap px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-bold border transition-all shrink-0 active:scale-95",
                        isActive
                          ? "bg-foreground text-background border-foreground"
                          : "bg-muted/50 text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                      )}
                    >
                      {col.name.split(" ")[0]}
                    </button>
                  )
                })}
              </div>
              {canScrollLeft && (
                <div className="pointer-events-none absolute left-0 top-0 bottom-0.5 w-4 bg-gradient-to-r from-card to-transparent" />
              )}
              {canScrollRight && (
                <div className="pointer-events-none absolute right-0 top-0 bottom-0.5 w-4 bg-gradient-to-l from-card to-transparent" />
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
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 sm:gap-2 px-0.5 py-0.5">
                {filtered.map((name) => {
                  const isSelected = value === name
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleSelect(name)}
                      aria-label={name}
                      aria-pressed={isSelected}
                      className="group relative flex items-center justify-center p-0.5 rounded-xl hover:bg-muted/40 transition-all active:scale-95 focus:outline-none"
                    >
                      <div className="relative size-12 sm:size-13">
                        <img
                          src={userpicUrl(name)}
                          alt={name}
                          className={cn(
                            "size-full rounded-full border-2 object-cover bg-muted transition-all",
                            isSelected
                              ? "border-foreground ring-2 ring-foreground shadow-sm scale-105"
                              : "border-border/80 group-hover:border-foreground/60 group-hover:scale-105"
                          )}
                        />
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/20">
                            <div className="size-4.5 sm:size-5 rounded-full bg-foreground text-background flex items-center justify-center shadow-xs">
                              <RiCheckLine size={11} className="stroke-[3]" />
                            </div>
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
          <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-border/70 bg-muted/30">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={userpicUrl(value)}
                alt=""
                className="size-8 sm:size-9 rounded-full border border-border bg-background shrink-0"
              />
              <div className="min-w-0">
                <p className="font-mono text-xs font-bold text-foreground truncate">{value}</p>
                <p className="font-mono text-[10px] text-muted-foreground truncate">
                  {activeCollection.name}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRandomize}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-foreground text-background font-mono text-[10px] sm:text-[11px] font-bold transition-all hover:opacity-90 active:scale-95 shrink-0"
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
