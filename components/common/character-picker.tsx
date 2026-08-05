/* eslint-disable @next/next/no-img-element */
"use client"

import { RiLayoutGridLine, RiSearchLine } from "@remixicon/react"
import { useState, useMemo } from "react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CHARACTER_COLLECTIONS, USERPIC_NAMES, userpicUrl } from "@/lib/userpics"
import { sound } from "@/lib/sound"

export function CharacterPicker({
  value,
  onSelect,
  size = "sm",
}: {
  value: string
  onSelect: (seed: string) => void
  size?: "sm" | "md"
}) {
  const [search, setSearch] = useState("")
  const [selectedCol, setSelectedCol] = useState("all")
  const buttonSize = size === "md" ? "size-8" : "size-7"
  const iconSize = size === "md" ? "size-4" : "size-3.5"

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
    sound.playPop(540)
    onSelect(name)
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label="Choose an SVG character"
            className={cn(
              "bg-foreground text-background absolute -right-1 -bottom-1 flex items-center justify-center rounded-full border-2 border-background shadow-md transition-transform hover:scale-110 focus:outline-hidden",
              buttonSize,
            )}
          >
            <RiLayoutGridLine className={iconSize} />
          </button>
        }
      />
      <PopoverContent side="top" align="center" className="w-80 p-4 rounded-2xl border-2 border-foreground bg-card shadow-2xl font-mono text-xs">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-foreground/15 pb-2">
            <span className="font-display text-xs font-black uppercase tracking-wider text-foreground">
              96-VECTOR CHARACTER ROSTER
            </span>
            <span className="text-[10px] text-muted-foreground font-bold">
              Select
            </span>
          </div>

          {/* Quick Collection Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CHARACTER_COLLECTIONS.slice(0, 6).map((col) => (
              <button
                key={col.id}
                type="button"
                onClick={() => {
                  setSelectedCol(col.id)
                  sound.playClick(460)
                }}
                className={`whitespace-nowrap px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                  selectedCol === col.id
                    ? "bg-foreground text-background border-foreground font-black"
                    : "bg-muted text-muted-foreground border-foreground/20 hover:text-foreground"
                }`}
              >
                {col.name.split(" ")[0]}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative">
            <RiSearchLine size={14} className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by series or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-muted text-foreground placeholder:text-muted-foreground w-full rounded-xl py-1.5 pl-8 pr-2 font-mono text-xs focus:outline-hidden border-2 border-foreground/20"
            />
          </div>

          {/* Avatar Grid */}
          <div className="grid max-h-56 grid-cols-5 gap-2 overflow-y-auto pr-1">
            {filtered.map((name) => {
              const isSelected = value === name
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleSelect(name)}
                  aria-label={name}
                  aria-pressed={isSelected}
                  className="rounded-full transition-transform hover:scale-115 focus:outline-hidden group p-0.5"
                  title={name}
                >
                  <img
                    src={userpicUrl(name)}
                    alt={name}
                    className={cn(
                      "bg-muted size-11 rounded-full border-2 object-cover transition-all",
                      isSelected
                        ? "border-foreground scale-105 shadow-xs ring-2 ring-foreground"
                        : "border-foreground/20 group-hover:border-foreground/60",
                    )}
                  />
                </button>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
