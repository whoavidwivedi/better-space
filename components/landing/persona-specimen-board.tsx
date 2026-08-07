/* eslint-disable @next/next/no-img-element */
"use client"

import {
  Search as RiSearchLine,
  Check as RiCheckLine,
  Shuffle as RiShuffleLine,
  ArrowRight as RiArrowRightLine,
  Volume2 as RiVolumeUpLine,
  X as RiCloseLine,
  Sparkles as RiSparklingLine
} from "lucide-react"
import Link from "next/link"
import React, { useState, useMemo } from "react"

import {
  DoodleArrow,
  DoodleCurlyArrow,
  DoodleCircle,
  DoodleSparkle,
  DoodleAsterisk,
} from "@/components/common/doodles"
import {
  ALL_USERPICS,
  CHARACTER_COLLECTIONS,
  getCharacterCollection,
  userpicUrl,
} from "@/lib/userpics"
import { sound } from "@/lib/sound"

export function PersonaSpecimenBoard() {
  const [selectedCollection, setSelectedCollection] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSeed, setActiveSeed] = useState("OSLO-1")
  const [claimed, setClaimed] = useState(false)

  const filteredCharacters = useMemo(() => {
    return ALL_USERPICS.filter((seed: string) => {
      const coll = getCharacterCollection(seed)
      const matchesColl =
        selectedCollection === "all" || coll.id === selectedCollection
      const matchesSearch =
        searchQuery.trim() === "" ||
        seed.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coll.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesColl && matchesSearch
    })
  }, [selectedCollection, searchQuery])

  const activeCollectionData = getCharacterCollection(activeSeed)

  const handleSelectCharacter = (seed: string) => {
    sound.playPop(500)
    setActiveSeed(seed)
    setClaimed(false)
  }

  const handlePlayTone = () => {
    let hash = 0
    for (let i = 0; i < activeSeed.length; i++) {
      hash = (hash * 31 + activeSeed.charCodeAt(i)) >>> 0
    }
    const freq = 200 + (hash % 500)
    sound.playTone(freq, "triangle", 0.3)
  }

  const handleClaim = () => {
    sound.playStamp()
    localStorage.setItem("better_space_active_avatar", activeSeed)
    setClaimed(true)
    setTimeout(() => setClaimed(false), 2500)
  }

  const handleRandomize = () => {
    const rand = ALL_USERPICS[Math.floor(Math.random() * ALL_USERPICS.length)]
    handleSelectCharacter(rand)
  }

  return (
    <section id="specimen" className="relative mx-auto w-full max-w-5xl py-16">
      {/* Header */}
      <div className="mb-10 flex flex-col justify-between gap-6 border-b border-border/80 pb-6 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
              SPECIMEN // 02
            </span>
            <span className="font-serif-display text-base text-foreground italic">
              96 Resolution-Independent Vectors
            </span>
          </div>
          <h2 className="font-display text-4xl font-black tracking-tight text-foreground sm:text-6xl">
            The Persona Archive
          </h2>
          <p className="mt-2 max-w-lg text-base font-normal text-muted-foreground">
            Choose your vector face. No signups, no profile photo uploads, zero
            tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRandomize}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 font-mono text-xs font-bold text-foreground transition-colors hover:border-foreground"
          >
            <RiShuffleLine size={15} />
            <span>Random Pick</span>
          </button>
        </div>
      </div>

      {/* Main Specimen Grid: Inspector Card (Left) + Grid (Right) */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Left 5 Cols: Large Inspector Specimen */}
        <div className="lg:sticky lg:top-24 lg:col-span-5">
          <div className="minimal-card flex flex-col items-center rounded-3xl border border-border bg-card p-6 text-center sm:p-8">
            {/* Stamp Tag */}
            <div className="mb-6 flex w-full items-center justify-between border-b border-border/60 pb-3 font-mono text-xs text-muted-foreground">
              <span>{activeCollectionData.name.toUpperCase()}</span>
              <span>INDEX #{activeSeed.replace(/\D/g, "") || "01"}</span>
            </div>

            {/* Giant Circular Avatar */}
            <div className="relative my-2">
              <div className="size-48 rounded-full border border-border bg-background p-2 shadow-xs sm:size-56">
                <img
                  src={userpicUrl(activeSeed)}
                  alt={activeSeed}
                  className="size-full rounded-full object-cover"
                />
              </div>

              {claimed && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/85 backdrop-blur-xs">
                  <span className="rounded-full border border-border px-3 py-1 font-mono text-xs font-bold tracking-widest text-foreground uppercase">
                    ✓ Claimed
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="mt-4 w-full">
              <h3 className="font-display text-2xl font-black text-foreground">
                {activeSeed}
              </h3>
              <p className="font-serif-display text-base text-muted-foreground italic">
                {activeCollectionData.tagline}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-6 flex w-full flex-col gap-2.5">
              <button
                onClick={handlePlayTone}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border font-mono text-xs font-bold text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                <RiVolumeUpLine size={15} />
                <span>Play Voice Tone</span>
              </button>

              <button
                onClick={handleClaim}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-foreground font-mono text-xs font-bold tracking-wider text-background uppercase transition-opacity hover:opacity-90"
              >
                {claimed ? (
                  <RiCheckLine size={15} />
                ) : (
                  <RiSparklingLine size={15} />
                )}
                <span>{claimed ? "Claimed as Active" : "Claim Character"}</span>
              </button>

              <Link
                href="/lobby"
                className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-border font-mono text-xs font-bold text-foreground transition-colors hover:bg-muted"
              >
                <span>Enter Live Studio</span>
                <RiArrowRightLine size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Search + Filter Tabs + 4-Col Grid */}
        <div className="flex flex-col gap-5 lg:col-span-7">
          {/* Search Bar */}
          <div className="relative">
            <RiSearchLine className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 96 characters by series or name..."
              className="h-11 w-full rounded-2xl border border-border bg-card pr-9 pl-10 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 right-3 flex size-5 -translate-y-1/2 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
              >
                <RiCloseLine size={12} />
              </button>
            )}
          </div>

          {/* Collection Pills */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => {
                sound.playClick(400)
                setSelectedCollection("all")
              }}
              className={`h-8 rounded-full px-3 font-mono text-xs transition-colors ${
                selectedCollection === "all"
                  ? "bg-foreground font-bold text-background"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({ALL_USERPICS.length})
            </button>
            {CHARACTER_COLLECTIONS.slice(1).map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  sound.playClick(450)
                  setSelectedCollection(c.id)
                }}
                className={`h-8 rounded-full px-3 font-mono text-xs transition-colors ${
                  selectedCollection === c.id
                    ? "bg-foreground font-bold text-background"
                    : "border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {c.name.split(" ")[0]}
              </button>
            ))}
          </div>

          {/* Character Grid */}
          <div className="grid max-h-[580px] grid-cols-3 gap-3 overflow-y-auto pr-1 sm:grid-cols-4">
            {filteredCharacters.map((seed: string) => {
              const isSelected = activeSeed === seed
              return (
                <button
                  key={seed}
                  onClick={() => handleSelectCharacter(seed)}
                  className={`flex flex-col items-center rounded-2xl border p-2.5 transition-colors ${
                    isSelected
                      ? "border-foreground bg-card shadow-xs"
                      : "border-transparent bg-background/50 hover:border-border"
                  }`}
                >
                  <div className="mb-1.5 size-14 overflow-hidden rounded-full border border-border bg-background sm:size-16">
                    <img
                      src={userpicUrl(seed)}
                      alt={seed}
                      className="size-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <span className="w-full truncate text-center font-display text-xs font-bold text-foreground">
                    {seed}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
