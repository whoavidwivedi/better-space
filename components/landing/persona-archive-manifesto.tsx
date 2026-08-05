/* eslint-disable @next/next/no-img-element */
"use client"

import {
  RiSearchLine,
  RiCheckLine,
  RiShuffleLine,
  RiArrowRightLine,
  RiVolumeUpLine,
  RiCloseLine,
  RiSparklingLine,
  RiFlashlightLine,
} from "@remixicon/react"
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
    <section id="archive" className="relative w-full py-20 border-b border-border/80">
      {/* 1. Recent.design Style Header with Meta Counter */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-2 font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <span>COLLECTION ARCHIVE</span>
            <span>•</span>
            <span className="text-foreground">96 VECTOR ARTIFACTS</span>
          </div>
          <h2 className="font-syne text-5xl sm:text-7xl font-black uppercase tracking-tight text-foreground">
            Specimen Vault
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-xl font-normal">
            Pure SVG vector personas curated for zero-login live spaces. Scalable to infinite resolutions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRandomize}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 font-mono text-xs font-bold text-foreground hover:border-foreground transition-colors shadow-xs"
          >
            <RiShuffleLine size={14} />
            <span>Random Specimen</span>
          </button>
        </div>
      </div>

      {/* 2. Recent.design Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
        {/* Pills Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 [scrollbar-width:none]">
          <button
            onClick={() => {
              sound.playClick(400)
              setSelectedCollection("all")
            }}
            className={`h-8 px-3.5 rounded-full font-mono text-xs whitespace-nowrap transition-colors ${
              selectedCollection === "all"
                ? "bg-foreground text-background font-bold"
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
              className={`h-8 px-3.5 rounded-full font-mono text-xs whitespace-nowrap transition-colors ${
                selectedCollection === c.id
                  ? "bg-foreground text-background font-bold"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search personas..."
            className="w-full h-8 pl-9 pr-8 rounded-full border border-border bg-card font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <RiCloseLine size={12} />
            </button>
          )}
        </div>
      </div>

      {/* 3. Main Grid: Featured Inspector (Left) + Editorial Cards (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 4 Cols: Featured Specimen Spotlight */}
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <div className="rounded-3xl border border-border bg-card p-6 flex flex-col items-center text-center shadow-xs">
            <div className="w-full flex items-center justify-between font-mono text-[11px] text-muted-foreground border-b border-border pb-3 mb-6">
              <span className="font-bold text-foreground">{activeColl.name.toUpperCase()}</span>
              <span>INDEX #{activeSeed.replace(/\D/g, "") || "01"}</span>
            </div>

            {/* Giant Circular Avatar */}
            <div className="relative my-2">
              <div className="size-48 sm:size-56 rounded-full border-2 border-foreground bg-background p-2.5 shadow-sm">
                <img
                  src={userpicUrl(activeSeed)}
                  alt={activeSeed}
                  className="size-full object-cover rounded-full"
                />
              </div>

              {claimed && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-xs rounded-full">
                  <span className="font-mono text-[11px] font-bold text-foreground uppercase tracking-widest px-3 py-1 border border-foreground rounded-full">
                    ✓ Active Persona
                  </span>
                </div>
              )}
            </div>

            {/* Name & Tagline */}
            <div className="mt-4 w-full">
              <h3 className="font-syne text-2xl sm:text-3xl font-black uppercase text-foreground">
                {activeSeed}
              </h3>
              <p className="font-serif-display italic text-base text-muted-foreground mt-0.5">
                {activeColl.tagline}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 w-full flex flex-col gap-2">
              <button
                onClick={() => handlePlayTone(activeSeed)}
                className="w-full h-10 rounded-xl border border-border font-mono text-xs font-bold text-muted-foreground hover:text-foreground hover:border-foreground transition-colors flex items-center justify-center gap-2"
              >
                <RiVolumeUpLine size={14} />
                <span>Test Voice Pitch</span>
              </button>

              <button
                onClick={handleClaim}
                className="w-full h-11 rounded-xl bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                {claimed ? <RiCheckLine size={15} /> : <RiSparklingLine size={15} />}
                <span>{claimed ? "Claimed Persona" : "Claim Active Persona"}</span>
              </button>

              <Link
                href={`/space/${activeSeed.toLowerCase()}-studio`}
                className="w-full h-10 rounded-xl border border-border font-mono text-xs font-bold text-foreground flex items-center justify-center gap-1.5 hover:bg-muted transition-colors"
              >
                <span>Launch Space as @{activeSeed.toLowerCase()}</span>
                <RiArrowRightLine size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* Right 8 Cols: Recent.design Style Specimen Cards Grid */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
            {filteredCharacters.map((seed: string) => {
              const isSelected = activeSeed === seed
              return (
                <div
                  key={seed}
                  onClick={() => handleSelectCharacter(seed)}
                  onMouseEnter={() => setHoveredSeed(seed)}
                  onMouseLeave={() => setHoveredSeed(null)}
                  className={`group relative flex flex-col p-3 rounded-2xl border cursor-pointer transition-[border-color,transform] duration-150 ${
                    isSelected
                      ? "border-foreground bg-card shadow-xs scale-[1.02]"
                      : "border-border/80 bg-card/60 hover:border-foreground/60 hover:bg-card"
                  }`}
                >
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mb-2 text-[10px] font-mono text-muted-foreground">
                    <span className="truncate">{seed}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-foreground">
                      48kHz
                    </span>
                  </div>

                  {/* Avatar Aspect Card */}
                  <div className="relative aspect-square rounded-xl bg-background border border-border overflow-hidden p-2 flex items-center justify-center">
                    <img
                      src={userpicUrl(seed)}
                      alt={seed}
                      className="size-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />

                    {/* Hover Tone Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePlayTone(seed)
                      }}
                      title="Play Harmonic Tone"
                      className="absolute bottom-1.5 right-1.5 size-7 rounded-full bg-foreground/90 text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-xs"
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
