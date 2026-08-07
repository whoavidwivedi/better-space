/* eslint-disable @next/next/no-img-element */
"use client"

import React, { useState, useEffect } from "react"
import {
  Sparkles as RiSparklingLine,
  Check as RiCheckLine,
  Search as RiSearchLine,
  Volume2 as RiVolumeUpLine,
  User as RiUser3Line,
} from "lucide-react"
import {
  USERPIC_NAMES,
  userpicUrl,
  CHARACTER_COLLECTIONS,
  getCharacterCollection,
} from "@/lib/userpics"
import { sound } from "@/lib/sound"

export function PersonaSelector() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [selectedAvatar, setSelectedAvatar] = useState("OSLO-1")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("better_space_active_avatar")
      if (saved) setSelectedAvatar(saved)
    }
  }, [])

  const handleSelect = (avatar: string) => {
    setSelectedAvatar(avatar)
    sound.playPop(560 + Math.random() * 120)
    localStorage.setItem("better_space_active_avatar", avatar)
  }

  const activeColObj =
    CHARACTER_COLLECTIONS.find((c) => c.id === activeCategory) ||
    CHARACTER_COLLECTIONS[0]

  const filteredCharacters = (
    activeCategory === "all" ? USERPIC_NAMES : activeColObj.characters
  ).filter((name) => name.toLowerCase().includes(searchQuery.toLowerCase()))

  const selectedCol = getCharacterCollection(selectedAvatar)

  return (
    <section
      id="personas"
      className="relative w-full border-b border-border/80 bg-background py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <div className="mb-2 inline-flex items-center gap-2 font-mono text-xs font-bold tracking-wider text-muted-foreground uppercase">
            <RiSparklingLine size={15} />
            <span>EXPRESSIVE IDENTITY • 96 SVG PERSONAS</span>
          </div>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Choose your vector persona.
          </h2>
          <p className="mt-3 text-sm font-normal text-muted-foreground sm:text-base">
            No profile setup or photo uploads required. Pick a handcrafted
            vector character to represent your voice across all audio rooms.
          </p>
        </div>

        {/* Studio Layout: Left Inspector / Right Character Grid */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Active Persona Inspector (Sticky) */}
          <div className="sticky top-24 rounded-3xl border border-border bg-card/80 p-6 shadow-lg backdrop-blur-md sm:p-8 lg:col-span-4">
            <div className="text-center">
              <span className="font-mono text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                CURRENT ACTIVE PERSONA
              </span>

              {/* Large Avatar Preview */}
              <div className="relative mx-auto my-6 size-40 rounded-full border-4 border-foreground/10 bg-muted/40 p-2 shadow-inner sm:size-48">
                <div className="size-full overflow-hidden rounded-full bg-muted">
                  <img
                    src={userpicUrl(selectedAvatar)}
                    alt={selectedAvatar}
                    className="size-full object-cover"
                  />
                </div>
              </div>

              <h3 className="font-display text-2xl font-bold text-foreground">
                {selectedAvatar}
              </h3>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                Series:{" "}
                <span className="font-bold text-foreground">
                  {selectedCol.name}
                </span>
              </p>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    sound.playTone(520, "sine", 0.25)
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-muted/60 py-2.5 font-mono text-xs font-bold text-foreground transition-colors hover:bg-muted active:scale-95"
                >
                  <RiVolumeUpLine size={15} />
                  <span>Test Audio Tone</span>
                </button>

                <a
                  href="/lobby"
                  onClick={() => sound.playStamp()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3 font-mono text-xs font-bold tracking-wider text-background uppercase shadow-md transition-transform hover:bg-foreground/90 active:scale-95"
                >
                  <RiCheckLine size={16} />
                  <span>Use In Room Now</span>
                </a>
              </div>
            </div>
          </div>

          {/* Character Grid & Filter Controls */}
          <div className="flex flex-col gap-6 lg:col-span-8">
            {/* Filter Pills & Search */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              {/* Category Pills */}
              <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0">
                {CHARACTER_COLLECTIONS.slice(0, 5).map((col) => {
                  const isActive = activeCategory === col.id
                  return (
                    <button
                      key={col.id}
                      onClick={() => {
                        sound.playClick(460)
                        setActiveCategory(col.id)
                      }}
                      className={`rounded-full px-3.5 py-1.5 font-mono text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                        isActive
                          ? "bg-foreground text-background"
                          : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {col.name} (
                      {col.id === "all"
                        ? USERPIC_NAMES.length
                        : col.characters.length}
                      )
                    </button>
                  )
                })}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-48">
                <RiSearchLine
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                  size={15}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search avatars..."
                  className="w-full rounded-full border border-border bg-card/60 py-1.5 pr-3 pl-8 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Avatars Grid */}
            <div className="no-scrollbar grid max-h-[500px] grid-cols-4 gap-3 overflow-y-auto rounded-2xl border border-border/50 bg-card/30 p-1 p-4 pr-2 sm:grid-cols-6 md:grid-cols-8">
              {filteredCharacters.map((name) => {
                const isSelected = selectedAvatar === name
                return (
                  <button
                    key={name}
                    onClick={() => handleSelect(name)}
                    className={`group relative flex flex-col items-center rounded-2xl p-2 transition-all duration-150 active:scale-90 ${
                      isSelected
                        ? "bg-foreground text-background shadow-md ring-2 ring-foreground"
                        : "border border-border/60 bg-card/70 hover:border-foreground/40 hover:bg-card"
                    }`}
                    title={name}
                  >
                    <div className="size-12 overflow-hidden rounded-full border border-border/60 bg-muted sm:size-14">
                      <img
                        src={userpicUrl(name)}
                        alt={name}
                        className="size-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <span
                      className={`mt-1.5 max-w-full truncate font-mono text-[9px] font-bold ${
                        isSelected
                          ? "text-background"
                          : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      {name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
