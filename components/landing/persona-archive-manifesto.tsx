/* eslint-disable @next/next/no-img-element */
"use client"

import {
  Search as RiSearchLine,
  Check as RiCheckLine,
  Shuffle as RiShuffleLine,
  ArrowRight as RiArrowRightLine,
  Volume2 as RiVolumeUpLine,
  X as RiCloseLine,
  Sparkles as RiSparklingLine,
  Flashlight as RiFlashlightLine
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
import { generateRoomSlug } from "@/lib/presets"

export function PersonaArchiveManifesto() {
  const [selectedCollection, setSelectedCollection] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSeed, setActiveSeed] = useState("OSLO-1")
  const [hoveredSeed, setHoveredSeed] = useState<string | null>(null)
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

  const activeColl = getCharacterCollection(activeSeed)

  const handleSelectCharacter = (seed: string) => {
    sound.playPop(500)
    setActiveSeed(seed)
    setClaimed(false)
  }

  const handlePlayTone = (seed: string = activeSeed) => {
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
    }
    const freq = 220 + (hash % 480)
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
    <section
      id="archive"
      className="relative w-full border-b border-border/80 py-20"
    >
      {/* 1. Recent.design Style Header with Meta Counter */}
      <div className="mb-12 flex flex-col justify-between gap-6 border-b border-border pb-6 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-muted-foreground uppercase">
            <span>COLLECTION ARCHIVE</span>
            <span>•</span>
            <span className="text-foreground">96 VECTOR ARTIFACTS</span>
          </div>
          <h2 className="font-syne text-5xl font-black tracking-tight text-foreground uppercase sm:text-7xl">
            Specimen Vault
          </h2>
          <p className="mt-2 max-w-xl text-sm font-normal text-muted-foreground sm:text-base">
            Pure SVG vector personas curated for zero-login live spaces.
            Scalable to infinite resolutions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRandomize}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 font-mono text-xs font-bold text-foreground shadow-xs transition-colors hover:border-foreground"
          >
            <RiShuffleLine size={14} />
            <span>Random Specimen</span>
          </button>
        </div>
      </div>

      {/* 2. Recent.design Filter Toolbar */}
      <div className="mb-8 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
        {/* Pills Carousel */}
        <div className="flex [scrollbar-width:none] items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0">
          <button
            onClick={() => {
              sound.playClick(400)
              setSelectedCollection("all")
            }}
            className={`h-8 rounded-full px-3.5 font-mono text-xs whitespace-nowrap transition-colors ${
              selectedCollection === "all"
                ? "bg-foreground font-bold text-background"
                : "border border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            All (96)
          </button>
          {CHARACTER_COLLECTIONS.slice(1).map((c) => (
            <button
              key={c.id}
              onClick={() => {
                sound.playClick(450)
                setSelectedCollection(c.id)
              }}
              className={`h-8 rounded-full px-3.5 font-mono text-xs whitespace-nowrap transition-colors ${
                selectedCollection === c.id
                  ? "bg-foreground font-bold text-background"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <RiSearchLine className="absolute top-1/2 left-3.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search personas..."
            className="h-8 w-full rounded-full border border-border bg-card pr-8 pl-9 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute top-1/2 right-2.5 flex size-4 -translate-y-1/2 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
            >
              <RiCloseLine size={12} />
            </button>
          )}
        </div>
      </div>

      {/* 3. Main Grid: Featured Inspector (Left) + Editorial Cards (Right) */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Left 4 Cols: Featured Specimen Spotlight */}
        <div className="lg:sticky lg:top-24 lg:col-span-4">
          <div className="flex flex-col items-center rounded-3xl border border-border bg-card p-6 text-center shadow-xs">
            <div className="mb-6 flex w-full items-center justify-between border-b border-border pb-3 font-mono text-[11px] text-muted-foreground">
              <span className="font-bold text-foreground">
                {activeColl.name.toUpperCase()}
              </span>
              <span>INDEX #{activeSeed.replace(/\D/g, "") || "01"}</span>
            </div>

            {/* Giant Circular Avatar */}
            <div className="relative my-2">
              <div className="size-48 rounded-full border-2 border-foreground bg-background p-2.5 shadow-sm sm:size-56">
                <img
                  src={userpicUrl(activeSeed)}
                  alt={activeSeed}
                  className="size-full rounded-full object-cover"
                />
              </div>

              {claimed && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/90 backdrop-blur-xs">
                  <span className="rounded-full border border-foreground px-3 py-1 font-mono text-[11px] font-bold tracking-widest text-foreground uppercase">
                    ✓ Active Persona
                  </span>
                </div>
              )}
            </div>

            {/* Name & Tagline */}
            <div className="mt-4 w-full">
              <h3 className="font-syne text-2xl font-black text-foreground uppercase sm:text-3xl">
                {activeSeed}
              </h3>
              <p className="mt-0.5 font-serif-display text-base text-muted-foreground italic">
                {activeColl.tagline}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex w-full flex-col gap-2">
              <button
                onClick={() => handlePlayTone(activeSeed)}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border font-mono text-xs font-bold text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                <RiVolumeUpLine size={14} />
                <span>Test Voice Pitch</span>
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
                <span>
                  {claimed ? "Claimed Persona" : "Claim Active Persona"}
                </span>
              </button>

              <Link
                href={`/space/${activeSeed}-studio`}
                className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-border font-mono text-xs font-bold text-foreground transition-colors hover:bg-muted"
              >
                <span>Launch Space as @{activeSeed.toLowerCase()}</span>
                <RiArrowRightLine size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* Right 8 Cols: Recent.design Style Specimen Cards Grid */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4">
            {filteredCharacters.map((seed: string) => {
              const isSelected = activeSeed === seed
              return (
                <div
                  key={seed}
                  onClick={() => handleSelectCharacter(seed)}
                  onMouseEnter={() => setHoveredSeed(seed)}
                  onMouseLeave={() => setHoveredSeed(null)}
                  className={`group relative flex cursor-pointer flex-col rounded-2xl border p-3 transition-[border-color,transform] duration-150 ${
                    isSelected
                      ? "scale-[1.02] border-foreground bg-card shadow-xs"
                      : "border-border/80 bg-card/60 hover:border-foreground/60 hover:bg-card"
                  }`}
                >
                  {/* Top Badge */}
                  <div className="mb-2 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                    <span className="truncate">{seed}</span>
                    <span className="text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      48kHz
                    </span>
                  </div>

                  {/* Avatar Aspect Card */}
                  <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-border bg-background p-2">
                    <img
                      src={userpicUrl(seed)}
                      alt={seed}
                      className="size-full rounded-lg object-cover transition-transform duration-200 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Hover Tone Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePlayTone(seed)
                      }}
                      title="Play Harmonic Tone"
                      className="absolute right-1.5 bottom-1.5 flex size-7 items-center justify-center rounded-full bg-foreground/90 text-background opacity-0 shadow-xs transition-opacity group-hover:opacity-100 hover:scale-110"
                    >
                      <RiVolumeUpLine size={13} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
