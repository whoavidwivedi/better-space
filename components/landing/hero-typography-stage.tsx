/* eslint-disable @next/next/no-img-element */
"use client"

import {
  RiMicLine,
  RiMicOffLine,
  RiArrowRightLine,
  RiVolumeUpLine,
  RiSparklingLine,
  RiShuffleLine,
} from "@remixicon/react"
import Link from "next/link"
import React, { useState, useEffect } from "react"

import {
  DoodleArrow,
  DoodleCurlyArrow,
  DoodleCircle,
  DoodleSparkle,
  DoodleUnderline,
  DoodleAsterisk,
  DoodleStar,
} from "@/components/common/doodles"
import { ALL_USERPICS, userpicUrl, getCharacterCollection } from "@/lib/userpics"
import { sound } from "@/lib/sound"

const FEATURED_PERSONAS = [
  {
    seed: "OSLO-1",
    name: "Avery",
    role: "Host",
    quote: "Crystal clear 48kHz audio directly in the browser.",
  },
  {
    seed: "Upstream-2",
    name: "Kenji",
    role: "Speaker",
    quote: "Zero login friction. Click a character and talk.",
  },
  {
    seed: "Afterclap-3",
    name: "Maya",
    role: "Speaker",
    quote: "Handcrafted vector faces that scale to any display.",
  },
  {
    seed: "Helsinki-1",
    name: "Lukas",
    role: "Speaker",
    quote: "Sub-35ms WebRTC edge latency across Tokyo & Frankfurt.",
  },
]

const EMOJI_BURSTS = ["🎙️", "✨", "🔥", "👏", "⚡"]

export function HeroTypographyStage() {
  const [selectedSeed, setSelectedSeed] = useState("OSLO-1")
  const [activeIdx, setActiveIdx] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [reactions, setReactions] = useState<{ id: number; emoji: string; x: number }[]>([])

  const currentPersona = FEATURED_PERSONAS[activeIdx]
  const currentCollection = getCharacterCollection(selectedSeed)

  // Subtle speaker cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => {
        const next = (prev + 1) % FEATURED_PERSONAS.length
        setSelectedSeed(FEATURED_PERSONAS[next].seed)
        return next
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSelectPersona = (seed: string, idx: number) => {
    sound.playPop(520 + idx * 40)
    setSelectedSeed(seed)
    setActiveIdx(idx)
    localStorage.setItem("better_space_active_avatar", seed)
  }

  const handleRandomize = () => {
    const randomSeed = ALL_USERPICS[Math.floor(Math.random() * ALL_USERPICS.length)]
    sound.playPop(640)
    setSelectedSeed(randomSeed)
    localStorage.setItem("better_space_active_avatar", randomSeed)
  }

  const triggerReaction = (emoji: string) => {
    sound.playReaction(emoji)
    setReactions((prev) => [
      ...prev.slice(-5),
      { id: Date.now() + Math.random(), emoji, x: Math.floor(Math.random() * 40) + 30 },
    ])
  }

  const toggleMic = () => {
    const next = !isMuted
    setIsMuted(next)
    sound.playMicToggle(next)
  }

  return (
    <section className="relative mx-auto w-full max-w-5xl pt-10 pb-16">
      {/* 1. Masthead Ticker */}
      <div className="flex items-center justify-between border-b border-border/80 pb-3 mb-10 text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <span className="size-2 rounded-full bg-foreground" />
          <span className="font-bold tracking-widest text-foreground uppercase">
            ISSUE 01 // AUDIO SPECIMEN
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-muted-foreground font-medium">
          <span>96 VECTOR FACES</span>
          <span>•</span>
          <span>WEBRTC SFU</span>
          <span>•</span>
          <span>ZERO PASSWORDS</span>
        </div>
      </div>

      {/* 2. GIGANTIC ARCHITECTURAL TYPOGRAPHY WITH INLINE CHARACTERS */}
      <div className="relative mb-12">
        {/* Top Handwritten Callout */}
        <div className="flex items-center gap-2 mb-3">
          <DoodleSparkle className="size-4 text-foreground/60" />
          <span className="font-handwritten text-lg sm:text-xl text-foreground">
            No accounts, no email. Just pick a persona.
          </span>
        </div>

        <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-foreground leading-[0.88]">
          TALK IN
          <br />
          <span className="inline-flex items-center gap-3 sm:gap-4 flex-wrap">
            <span>PURE</span>
            {/* Inline Avatar Pill in Headline */}
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 sm:px-4 py-1.5 align-middle shadow-xs">
              <span className="size-8 sm:size-12 rounded-full overflow-hidden border border-border">
                <img
                  src={userpicUrl(selectedSeed)}
                  alt="Active Persona"
                  className="size-full object-cover"
                />
              </span>
              <span className="font-mono text-xs sm:text-base font-bold text-foreground lowercase tracking-normal">
                @{selectedSeed.toLowerCase()}
              </span>
            </span>
            <span className="relative">
              VOICE.
              <DoodleUnderline className="absolute -bottom-3 sm:-bottom-5 left-0 w-full text-foreground/80" />
            </span>
          </span>
        </h1>

        {/* Sub-headline & Callouts */}
        <div className="mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2">
          <p className="max-w-md text-base sm:text-lg text-muted-foreground font-normal leading-relaxed">
            High-fidelity 48kHz audio spaces populated by 96 resolution-independent vector personas. Open a room, share a link, speak your mind.
          </p>

          <div className="flex items-center gap-4">
            <Link
              href="/lobby"
              className="h-12 px-7 rounded-full bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <span>Launch Studio Space</span>
              <RiArrowRightLine size={16} />
            </Link>

            <div className="hidden lg:flex items-center gap-1.5">
              <DoodleCurlyArrow className="size-7 text-foreground/60 -rotate-12" />
              <span className="font-handwritten text-base text-muted-foreground">
                Zero setup
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE HERO STAGE SPECIMEN */}
      <div className="minimal-card relative rounded-3xl p-6 sm:p-10 bg-card border border-border">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left 7 Cols: Speaking Character + Dynamic Quote */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Speech Quote */}
            <div className="relative mb-5 max-w-md">
              <div className="rounded-2xl border border-border bg-background p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between gap-2 mb-1.5 font-mono text-[10px] text-muted-foreground uppercase font-bold">
                  <span>
                    {currentPersona.name} ({currentPersona.role})
                  </span>
                  <span>{currentCollection.name}</span>
                </div>
                <p className="font-serif-display text-2xl sm:text-3xl italic text-foreground leading-snug">
                  &ldquo;{currentPersona.quote}&rdquo;
                </p>
              </div>
              <div className="absolute -bottom-2 left-8 sm:left-12 size-3 bg-background border-r border-b border-border rotate-45" />
            </div>

            {/* Stage Character Showcase */}
            <div className="relative my-3 flex items-center justify-center">
              {/* Doodle circle around avatar */}
              <DoodleCircle className="absolute -inset-4 size-56 sm:size-64 text-foreground/15 pointer-events-none rotate-[-4deg]" />

              <div className="relative size-44 sm:size-52 rounded-full border border-border bg-background p-2 shadow-xs">
                <img
                  src={userpicUrl(selectedSeed)}
                  alt={selectedSeed}
                  className="size-full object-cover rounded-full"
                />

                {/* Speaking Waveform EQ */}
                {!isMuted && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-foreground text-background px-3 py-1 rounded-full shadow-xs">
                    <div className="flex items-end gap-0.5 h-3">
                      <span className="w-0.5 bg-background rounded-full animate-eq-1" />
                      <span className="w-0.5 bg-background rounded-full animate-eq-2" />
                      <span className="w-0.5 bg-background rounded-full animate-eq-3" />
                      <span className="w-0.5 bg-background rounded-full animate-eq-4" />
                    </div>
                    <span className="font-mono text-[9px] font-bold tracking-wider uppercase">
                      48KHZ LIVE
                    </span>
                  </div>
                )}
              </div>

              {/* Floating Emojis */}
              <div className="absolute inset-0 pointer-events-none overflow-visible">
                {reactions.map((r) => (
                  <div
                    key={r.id}
                    className="absolute text-3xl animate-reaction-drift select-none"
                    style={{ left: `${r.x}%`, top: "25%" }}
                  >
                    {r.emoji}
                  </div>
                ))}
              </div>
            </div>

            {/* Persona Tag & Voice Tone Preview */}
            <div className="mt-2 flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-foreground">
                Active: {selectedSeed}
              </span>
              <button
                onClick={() => {
                  let hash = 0
                  for (let i = 0; i < selectedSeed.length; i++) {
                    hash = (hash * 31 + selectedSeed.charCodeAt(i)) >>> 0
                  }
                  sound.playTone(200 + (hash % 500), "triangle", 0.3)
                }}
                className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors px-2 py-0.5 rounded-md border border-border"
              >
                <RiVolumeUpLine size={13} />
                <span>Hear Voice Tone</span>
              </button>
            </div>
          </div>

          {/* Right 5 Cols: Quick Swapper & Stage Controls */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Cast Quick Swapper */}
            <div className="rounded-2xl border border-border p-4 bg-muted/30">
              <div className="flex items-center justify-between mb-3 font-mono text-[11px]">
                <span className="font-bold text-muted-foreground uppercase">
                  Switch Cast Persona
                </span>
                <button
                  onClick={handleRandomize}
                  className="text-foreground hover:underline inline-flex items-center gap-1 font-bold"
                >
                  <RiShuffleLine size={12} />
                  <span>Random Roll</span>
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {FEATURED_PERSONAS.map((p, idx) => {
                  const isSelected = selectedSeed === p.seed
                  return (
                    <button
                      key={p.seed}
                      onClick={() => handleSelectPersona(p.seed, idx)}
                      className={`flex flex-col items-center p-2 rounded-xl border transition-colors ${
                        isSelected
                          ? "border-foreground bg-card shadow-xs"
                          : "border-transparent bg-background/50 hover:border-border"
                      }`}
                    >
                      <div className="size-10 sm:size-12 rounded-full border border-border overflow-hidden mb-1">
                        <img
                          src={userpicUrl(p.seed)}
                          alt={p.name}
                          className="size-full object-cover"
                        />
                      </div>
                      <span className="font-display font-bold text-[11px] text-foreground truncate w-full text-center">
                        {p.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Microphone Hardware Switch & Emoji reactions */}
            <div className="rounded-2xl border border-border p-4 bg-muted/30 flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold uppercase text-muted-foreground">
                  Mic &amp; Stage Reactions
                </span>
                <button
                  onClick={toggleMic}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] font-bold border transition-colors ${
                    isMuted
                      ? "border-border text-muted-foreground bg-background"
                      : "border-foreground bg-foreground text-background"
                  }`}
                >
                  {isMuted ? <RiMicOffLine size={13} /> : <RiMicLine size={13} />}
                  <span>{isMuted ? "Muted" : "Live Input"}</span>
                </button>
              </div>

              <div className="flex items-center justify-between gap-1.5">
                {EMOJI_BURSTS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => triggerReaction(emoji)}
                    className="size-9 sm:size-10 rounded-xl border border-border bg-background flex items-center justify-center text-lg hover:border-foreground/40 transition-colors shadow-xs"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Enter Stage Button */}
            <Link
              href="/lobby"
              className="w-full h-12 rounded-2xl bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <span>Enter Live Stage Room</span>
              <RiArrowRightLine size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
