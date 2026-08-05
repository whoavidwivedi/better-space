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
} from "@remixicon/react"
import Link from "next/link"
import React, { useState, useMemo } from "react"

import {
  DoodleArrow,
  DoodleCurlyArrow,
  DoodleCircle,
  DoodleSparkle,
  DoodleUnderline,
  DoodleAsterisk,
} from "@/components/common/doodles"
import {
  ALL_USERPICS,
  CHARACTER_COLLECTIONS,
  getCharacterCollection,
  userpicUrl,
} from "@/lib/userpics"
import { sound } from "@/lib/sound"

export function CharacterCastArchive() {
  const [selectedCollection, setSelectedCollection] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSeed, setSelectedSeed] = useState("OSLO-1")
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

  const selectedCollectionData = getCharacterCollection(selectedSeed)

  const handleSelectCharacter = (seed: string) => {
    sound.playPop(520)
    setSelectedSeed(seed)
    setClaimed(false)
  }

  const handlePlayVoicePreview = () => {
    let hash = 0
    for (let i = 0; i < selectedSeed.length; i++) {
      hash = (hash * 31 + selectedSeed.charCodeAt(i)) >>> 0
    }
    const freq = 220 + (hash % 500)
    sound.playTone(freq, "triangle", 0.3)
  }

  const handleClaim = () => {
    sound.playStamp()
    localStorage.setItem("better_space_active_avatar", selectedSeed)
    setClaimed(true)
    setTimeout(() => setClaimed(false), 2500)
  }

  const handleRandomSelect = () => {
    const rand = ALL_USERPICS[Math.floor(Math.random() * ALL_USERPICS.length)]
    handleSelectCharacter(rand)
  }

  return (
    <section id="archive" className="relative mx-auto w-full max-w-5xl py-16">
      {/* Minimal Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              ARCHIVE
            </span>
            <span className="font-serif-display italic text-base text-foreground">
              96 Handcrafted Vectors
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-6xl font-black tracking-tight text-foreground">
            The Avatar Cast
          </h2>
          <p className="mt-2 text-base text-muted-foreground font-normal max-w-lg">
            Vector SVGs that scale infinitely on every screen. Select a persona and enter any room.
          </p>
        </div>

        <button
          onClick={handleRandomSelect}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 font-mono text-xs font-bold text-foreground hover:border-foreground transition-colors self-start sm:self-auto"
        >
          <RiShuffleLine size={15} />
          <span>Random Roll</span>
        </button>
      </div>

      {/* Main Grid: Clean Preview (Left) + Character Collection (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Minimal Selected Character Specimen */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <div className="minimal-card rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center bg-card border border-border">
            {/* Header Stamp */}
            <div className="w-full flex items-center justify-between font-mono text-xs text-muted-foreground border-b border-border/60 pb-3 mb-6">
              <span>{selectedCollectionData.name.toUpperCase()}</span>
              <span>INDEX #{selectedSeed.replace(/\D/g, "") || "01"}</span>
            </div>

            {/* Avatar Preview */}
            <div className="relative my-2">
              <div className="size-48 sm:size-56 rounded-full border border-border bg-background p-2 shadow-xs">
                <img
                  src={userpicUrl(selectedSeed)}
                  alt={selectedSeed}
                  className="size-full object-cover rounded-full"
                />
              </div>

              {claimed && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/85 backdrop-blur-xs rounded-full">
                  <span className="font-mono text-xs font-bold text-foreground uppercase tracking-widest px-3 py-1 border border-border rounded-full">
                    ✓ Claimed
                  </span>
                </div>
              )}
            </div>

            {/* Character Info */}
            <div className="mt-4 w-full">
              <h3 className="font-display text-2xl font-black text-foreground">
                {selectedSeed}
              </h3>
              <p className="font-serif-display italic text-base text-muted-foreground">
                {selectedCollectionData.tagline}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-6 w-full flex flex-col gap-2.5">
              <button
                onClick={handlePlayVoicePreview}
                className="w-full h-10 rounded-xl border border-border font-mono text-xs font-bold text-muted-foreground hover:text-foreground hover:border-foreground transition-colors flex items-center justify-center gap-2"
              >
                <RiVolumeUpLine size={15} />
                <span>Test Tone</span>
              </button>

              <button
                onClick={handleClaim}
                className="w-full h-11 rounded-xl bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                {claimed ? <RiCheckLine size={15} /> : <RiSparklingLine size={15} />}
                <span>{claimed ? "Claimed as Active" : "Claim Character"}</span>
              </button>

              <Link
                href="/lobby"
                className="w-full h-10 rounded-xl border border-border font-mono text-xs font-bold text-foreground flex items-center justify-center gap-1.5 hover:bg-muted transition-colors"
              >
                <span>Enter Room</span>
                <RiArrowRightLine size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Search + Minimal Pills + Grid */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Search Bar */}
          <div className="relative">
            <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search characters by series or name..."
              className="w-full h-11 pl-10 pr-9 rounded-2xl border border-border bg-card font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 size-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <RiCloseLine size={12} />
              </button>
            )}
          </div>

          {/* Minimal Collection Pills */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => {
                sound.playClick(400)
                setSelectedCollection("all")
              }}
              className={`h-8 px-3 rounded-full font-mono text-xs transition-colors ${
                selectedCollection === "all"
                  ? "bg-foreground text-background font-bold"
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
                className={`h-8 px-3 rounded-full font-mono text-xs transition-colors ${
                  selectedCollection === c.id
                    ? "bg-foreground text-background font-bold"
                    : "border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {c.name.split(" ")[0]}
              </button>
            ))}
          </div>

          {/* Clean 4-Col Avatar Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[580px] overflow-y-auto pr-1">
            {filteredCharacters.map((seed: string) => {
              const isSelected = selectedSeed === seed
              return (
                <button
                  key={seed}
                  onClick={() => handleSelectCharacter(seed)}
                  className={`flex flex-col items-center p-2.5 rounded-2xl border transition-colors ${
                    isSelected
                      ? "border-foreground bg-card shadow-xs"
                      : "border-transparent bg-background/50 hover:border-border"
                  }`}
                >
                  <div className="size-14 sm:size-16 rounded-full border border-border bg-background overflow-hidden mb-1.5">
                    <img
                      src={userpicUrl(seed)}
                      alt={seed}
                      className="size-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <span className="font-display font-bold text-xs text-foreground truncate w-full text-center">
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
