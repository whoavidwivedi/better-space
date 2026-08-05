/* eslint-disable @next/next/no-img-element */
"use client"

import {
  RiSearchLine,
  RiShuffleLine,
  RiCheckLine,
  RiUser3Line,
  RiEditLine,
} from "@remixicon/react"
import { useState, useMemo } from "react"

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CHARACTER_COLLECTIONS, USERPIC_NAMES, userpicUrl, randomUserpic } from "@/lib/userpics"

export function CharacterPicker({
  value,
  onSelect,
  size = "sm",
  trigger,
}: {
  value: string
  onSelect: (seed: string) => void
  size?: "sm" | "md" | "lg"
  trigger?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedCol, setSelectedCol] = useState("all")

  const buttonSize = size === "lg" ? "size-9" : size === "md" ? "size-8" : "size-7"
  const iconSize = size === "lg" ? "size-4" : size === "md" ? "size-3.5" : "size-3"

  const filtered = useMemo(() => {
    let list = USERPIC_NAMES
    if (selectedCol !== "all") {
      const col = CHARACTER_COLLECTIONS.find((c) => c.id === selectedCol)
      if (col) list = col.characters
    }
    if (search.trim()) {
      list = list.filter((n) => n.toLowerCase().includes(search.toLowerCase()))
    }
    return list
  }, [selectedCol, search])

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
        className="w-[min(22rem,calc(100vw-1.5rem))] sm:w-[min(28rem,calc(100vw-2rem))] rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-border bg-card shadow-2xl"
      >
        <div className="flex flex-col gap-3">
          {/* Header */}
          <PopoverHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-6 sm:size-7 items-center justify-center rounded-full bg-muted border border-border shrink-0">
                <RiUser3Line size={13} className="text-foreground" />
              </div>
              <div>
                <PopoverTitle className="font-display text-sm sm:text-base font-bold text-foreground">
                  Choose Persona
                </PopoverTitle>
                <PopoverDescription className="font-mono text-[10px] sm:text-xs text-muted-foreground">
                  Pick your avatar for voice spaces.
                </PopoverDescription>
              </div>
            </div>
          </PopoverHeader>

          {/* Category Pills & Shuffle */}
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1 -mx-0.5 px-0.5 pb-0.5">
              <button
                type="button"
                onClick={() => setSelectedCol("all")}
                className={`whitespace-nowrap px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-bold border transition-colors shrink-0 ${
                  selectedCol === "all"
                    ? "bg-foreground text-background border-foreground"
                    : "bg-muted/50 text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                }`}
              >
                All
              </button>
              {CHARACTER_COLLECTIONS.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => setSelectedCol(col.id)}
                  className={`whitespace-nowrap px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-bold border transition-colors shrink-0 ${
                    selectedCol === col.id
                      ? "bg-foreground text-background border-foreground"
                      : "bg-muted/50 text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {col.name.split(" ")[0]}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleRandomize}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-border bg-muted/80 hover:bg-muted text-[10px] sm:text-[11px] font-mono font-semibold text-foreground transition-all active:scale-95 shrink-0"
              title="Pick a random persona"
            >
              <RiShuffleLine size={12} />
              <span className="hidden sm:inline">Shuffle</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <RiSearchLine size={14} className="text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg bg-muted/40 py-1.5 pl-8 pr-3 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 border border-border focus:border-foreground focus:outline-none transition-colors"
            />
          </div>

          {/* Avatar Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 sm:gap-2 max-h-56 sm:max-h-64 overflow-y-auto overscroll-contain py-0.5 pr-0.5">
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
        </div>
      </PopoverContent>
    </Popover>
  )
}
