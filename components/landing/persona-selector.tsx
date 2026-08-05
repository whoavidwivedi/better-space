/* eslint-disable @next/next/no-img-element */
"use client"

import React, { useState, useEffect } from "react"
import {
  RiSparklingLine,
  RiCheckLine,
  RiSearchLine,
  RiVolumeUpLine,
  RiUser3Line,
} from "@remixicon/react"
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

  const activeColObj = CHARACTER_COLLECTIONS.find((c) => c.id === activeCategory) || CHARACTER_COLLECTIONS[0]

  const filteredCharacters = (activeCategory === "all" ? USERPIC_NAMES : activeColObj.characters).filter(
    (name) => name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedCol = getCharacterCollection(selectedAvatar)

  return (
    <section id="personas" className="relative w-full border-b border-border/80 bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            <RiSparklingLine size={15} />
            <span>EXPRESSIVE IDENTITY • 96 SVG PERSONAS</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Choose your vector persona.
          </h2>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base font-normal">
            No profile setup or photo uploads required. Pick a handcrafted vector character to represent your voice across all audio rooms.
          </p>
        </div>

        {/* Studio Layout: Left Inspector / Right Character Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Active Persona Inspector (Sticky) */}
          <div className="lg:col-span-4 rounded-3xl border border-border bg-card/80 p-6 sm:p-8 backdrop-blur-md shadow-lg sticky top-24">
            <div className="text-center">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                CURRENT ACTIVE PERSONA
              </span>

              {/* Large Avatar Preview */}
              <div className="relative mx-auto my-6 size-40 sm:size-48 rounded-full border-4 border-foreground/10 p-2 bg-muted/40 shadow-inner">
                <div className="size-full rounded-full overflow-hidden bg-muted">
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
              <p className="font-mono text-xs text-muted-foreground mt-1">
                Series: <span className="font-bold text-foreground">{selectedCol.name}</span>
              </p>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    sound.playTone(520, "sine", 0.25)
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-border bg-muted/60 hover:bg-muted py-2.5 font-mono text-xs font-bold text-foreground transition-colors active:scale-95"
                >
                  <RiVolumeUpLine size={15} />
                  <span>Test Audio Tone</span>
                </button>

                <a
                  href="/lobby"
                  onClick={() => sound.playStamp()}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background py-3 font-mono text-xs font-bold uppercase tracking-wider hover:bg-foreground/90 transition-transform active:scale-95 shadow-md"
                >
                  <RiCheckLine size={16} />
                  <span>Use In Room Now</span>
                </a>
              </div>
            </div>
          </div>

          {/* Character Grid & Filter Controls */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Filter Pills & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                {CHARACTER_COLLECTIONS.slice(0, 5).map((col) => {
                  const isActive = activeCategory === col.id
                  return (
                    <button
                      key={col.id}
                      onClick={() => {
                        sound.playClick(460)
                        setActiveCategory(col.id)
                      }}
                      className={`whitespace-nowrap rounded-full px-3.5 py-1.5 font-mono text-xs font-bold transition-all active:scale-95 ${
                        isActive
                          ? "bg-foreground text-background"
                          : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {col.name} ({col.id === "all" ? USERPIC_NAMES.length : col.characters.length})
                    </button>
                  )
                })}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-48">
                <RiSearchLine
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  size={15}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search avatars..."
                  className="w-full rounded-full border border-border bg-card/60 pl-8 pr-3 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
                />
              </div>
            </div>

            {/* Avatars Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 max-h-[500px] overflow-y-auto p-1 pr-2 no-scrollbar rounded-2xl border border-border/50 bg-card/30 p-4">
              {filteredCharacters.map((name) => {
                const isSelected = selectedAvatar === name
                return (
                  <button
                    key={name}
                    onClick={() => handleSelect(name)}
                    className={`group relative flex flex-col items-center rounded-2xl p-2 transition-all duration-150 active:scale-90 ${
                      isSelected
                        ? "bg-foreground text-background ring-2 ring-foreground shadow-md"
                        : "bg-card/70 hover:bg-card hover:border-foreground/40 border border-border/60"
                    }`}
                    title={name}
                  >
                    <div className="size-12 sm:size-14 rounded-full overflow-hidden bg-muted border border-border/60">
                      <img
                        src={userpicUrl(name)}
                        alt={name}
                        className="size-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <span
                      className={`font-mono text-[9px] font-bold mt-1.5 truncate max-w-full ${
                        isSelected ? "text-background" : "text-muted-foreground group-hover:text-foreground"
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
