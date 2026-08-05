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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
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
      <DialogContent
        className="w-[min(32rem,calc(100vw-2rem))] p-5 sm:p-6 rounded-3xl border border-border bg-card shadow-2xl"
      >
        <div className="flex flex-col gap-4">
          {/* Header */}
          <DialogHeader className="pr-8">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-full bg-muted border border-border">
                <RiUser3Line size={14} className="text-foreground" />
              </div>
              <div>
                <DialogTitle className="font-display text-base sm:text-lg font-bold">
                  Choose Avatar Persona
                </DialogTitle>
                <DialogDescription className="font-mono text-xs text-muted-foreground mt-0.5">
                  Select your persona for voice spaces.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Quick Actions & Series Filter */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1">
                <button
                  type="button"
                  onClick={() => setSelectedCol("all")}
                  className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-mono font-bold border transition-colors ${
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
                    className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-mono font-bold border transition-colors ${
                      selectedCol === col.id
                        ? "bg-foreground text-background border-foreground"
                        : "bg-muted/50 text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {col.name.split(" ")[0]}
                  </button>
                ))}
              </div>

              {/* Instant Shuffle */}
              <button
                type="button"
                onClick={handleRandomize}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-muted/80 hover:bg-muted text-xs font-mono font-semibold text-foreground transition-all active:scale-95 shrink-0"
                title="Pick a random persona"
              >
                <RiShuffleLine size={13} />
                <span>Shuffle</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <RiSearchLine size={15} className="text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search personas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl bg-muted/40 py-2 pl-9 pr-3 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 border border-border focus:border-foreground focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Avatar Grid */}
          <div className="grid max-h-72 grid-cols-4 sm:grid-cols-6 gap-2.5 sm:gap-3 overflow-y-auto pr-1 py-1">
            {filtered.map((name) => {
              const isSelected = value === name
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleSelect(name)}
                  aria-label={name}
                  aria-pressed={isSelected}
                  className="group relative flex flex-col items-center justify-center p-1 rounded-2xl hover:bg-muted/40 transition-all active:scale-95 focus:outline-none"
                >
                  <div className="relative size-12 sm:size-14">
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
                        <div className="size-5 rounded-full bg-foreground text-background flex items-center justify-center shadow-xs">
                          <RiCheckLine size={12} className="stroke-[3]" />
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
