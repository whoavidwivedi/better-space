/* eslint-disable @next/next/no-img-element */
"use client"

import {
  Mic as RiMicLine,
  MicOff as RiMicOffLine,
  ArrowRight as RiArrowRightLine,
  Volume2 as RiVolumeUpLine,
  Sparkles as RiSparklingLine,
  Shuffle as RiShuffleLine,
} from "lucide-react"
import Link from "next/link"
import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

import {
  DoodleArrow,
  DoodleCurlyArrow,
  DoodleCircle,
  DoodleSparkle,
  DoodleUnderline,
  DoodleAsterisk,
  DoodleStar,
} from "@/components/common/doodles"
import {
  ALL_USERPICS,
  userpicUrl,
  getCharacterCollection,
} from "@/lib/userpics"
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
  const [reactions, setReactions] = useState<
    { id: number; emoji: string; x: number }[]
  >([])

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
    const randomSeed =
      ALL_USERPICS[Math.floor(Math.random() * ALL_USERPICS.length)]
    sound.playPop(640)
    setSelectedSeed(randomSeed)
    localStorage.setItem("better_space_active_avatar", randomSeed)
  }

  const triggerReaction = (emoji: string) => {
    sound.playReaction(emoji)
    setReactions((prev) => [
      ...prev.slice(-5),
      {
        id: Date.now() + Math.random(),
        emoji,
        x: Math.floor(Math.random() * 40) + 30,
      },
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
      <div className="mb-10 flex items-center justify-between border-b border-border/80 pb-3 font-mono text-xs">
        <div className="flex items-center gap-2.5">
          <span className="size-2 rounded-full bg-foreground" />
          <span className="font-bold tracking-widest text-foreground uppercase">
            ISSUE 01 // AUDIO SPECIMEN
          </span>
        </div>
        <div className="hidden items-center gap-4 font-medium text-muted-foreground sm:flex">
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
        <div className="mb-3 flex items-center gap-2">
          <DoodleSparkle className="size-4 text-foreground/60" />
          <span className="font-handwritten text-lg text-foreground sm:text-xl">
            No accounts, no email. Just pick a persona.
          </span>
        </div>

        <h1 className="font-display text-5xl leading-[0.88] font-black tracking-tighter text-foreground uppercase sm:text-7xl md:text-8xl lg:text-9xl">
          TALK IN
          <br />
          <span className="inline-flex flex-wrap items-center gap-3 sm:gap-4">
            <span>PURE</span>
            {/* Inline Avatar Pill in Headline */}
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 align-middle shadow-xs sm:px-4">
              <span className="size-8 overflow-hidden rounded-full border border-border sm:size-12">
                <img
                  src={userpicUrl(selectedSeed)}
                  alt="Active Persona"
                  className="size-full object-cover"
                />
              </span>
              <span className="font-mono text-xs font-bold tracking-normal text-foreground lowercase sm:text-base">
                @{selectedSeed.toLowerCase()}
              </span>
            </span>
            <span className="relative">
              VOICE.
              <DoodleUnderline className="absolute -bottom-3 left-0 w-full text-foreground/80 sm:-bottom-5" />
            </span>
          </span>
        </h1>

        {/* Sub-headline & Callouts */}
        <div className="mt-8 flex flex-col justify-between gap-6 pt-2 md:flex-row md:items-end">
          <p className="max-w-md text-base leading-relaxed font-normal text-muted-foreground sm:text-lg">
            High-fidelity 48kHz audio spaces populated by 96
            resolution-independent vector personas. Open a room, share a link,
            speak your mind.
          </p>

          <div className="flex items-center gap-4">
            <Button
              className="h-11 gap-2 rounded-xl bg-foreground px-7 font-mono text-xs font-bold tracking-wider text-background uppercase shadow-sm hover:bg-foreground/90"
              render={<Link href="/lobby" />}
              nativeButton={false}
            >
              <span>Launch Studio Space</span>
              <RiArrowRightLine size={16} />
            </Button>

            <div className="hidden items-center gap-1.5 lg:flex">
              <DoodleCurlyArrow className="size-7 -rotate-12 text-foreground/60" />
              <span className="font-handwritten text-base text-muted-foreground">
                Zero setup
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE HERO STAGE SPECIMEN */}
      <div className="minimal-card relative rounded-3xl border border-border bg-card p-6 sm:p-10">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          {/* Left 7 Cols: Speaking Character + Dynamic Quote */}
          <div className="flex flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-left">
            {/* Speech Quote */}
            <div className="relative mb-5 max-w-md">
              <div className="rounded-2xl border border-border bg-background p-4 shadow-xs sm:p-5">
                <div className="mb-1.5 flex items-center justify-between gap-2 font-mono text-[10px] font-bold text-muted-foreground uppercase">
                  <span>
                    {currentPersona.name} ({currentPersona.role})
                  </span>
                  <span>{currentCollection.name}</span>
                </div>
                <p className="font-serif-display text-2xl leading-snug text-foreground italic sm:text-3xl">
                  &ldquo;{currentPersona.quote}&rdquo;
                </p>
              </div>
              <div className="absolute -bottom-2 left-8 size-3 rotate-45 border-r border-b border-border bg-background sm:left-12" />
            </div>

            {/* Stage Character Showcase */}
            <div className="relative my-3 flex items-center justify-center">
              {/* Doodle circle around avatar */}
              <DoodleCircle className="pointer-events-none absolute -inset-4 size-56 rotate-[-4deg] text-foreground/15 sm:size-64" />

              <div className="relative size-44 rounded-full border border-border bg-background p-2 shadow-xs sm:size-52">
                <img
                  src={userpicUrl(selectedSeed)}
                  alt={selectedSeed}
                  className="size-full rounded-full object-cover"
                />

                {/* Speaking Waveform EQ */}
                {!isMuted && (
                  <div className="absolute right-2 bottom-2 flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1 text-background shadow-xs">
                    <div className="flex h-3 items-end gap-0.5">
                      <span className="animate-eq-1 w-0.5 rounded-full bg-background" />
                      <span className="animate-eq-2 w-0.5 rounded-full bg-background" />
                      <span className="animate-eq-3 w-0.5 rounded-full bg-background" />
                      <span className="animate-eq-4 w-0.5 rounded-full bg-background" />
                    </div>
                    <span className="font-mono text-[9px] font-bold tracking-wider uppercase">
                      48KHZ LIVE
                    </span>
                  </div>
                )}
              </div>

              {/* Floating Emojis */}
              <div className="pointer-events-none absolute inset-0 overflow-visible">
                {reactions.map((r) => (
                  <div
                    key={r.id}
                    className="animate-reaction-drift absolute text-3xl select-none"
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
                className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
              >
                <RiVolumeUpLine size={13} />
                <span>Hear Voice Tone</span>
              </button>
            </div>
          </div>

          {/* Right 5 Cols: Quick Swapper & Stage Controls */}
          <div className="flex flex-col gap-5 lg:col-span-5">
            {/* Cast Quick Swapper */}
            <div className="rounded-2xl border border-border bg-muted/30 p-4">
              <div className="mb-3 flex items-center justify-between font-mono text-[11px]">
                <span className="font-bold text-muted-foreground uppercase">
                  Switch Cast Persona
                </span>
                <button
                  onClick={handleRandomize}
                  className="inline-flex items-center gap-1 font-bold text-foreground hover:underline"
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
                      className={`flex flex-col items-center rounded-xl border p-2 transition-colors ${
                        isSelected
                          ? "border-foreground bg-card shadow-xs"
                          : "border-transparent bg-background/50 hover:border-border"
                      }`}
                    >
                      <div className="mb-1 size-10 overflow-hidden rounded-full border border-border sm:size-12">
                        <img
                          src={userpicUrl(p.seed)}
                          alt={p.name}
                          className="size-full object-cover"
                        />
                      </div>
                      <span className="w-full truncate text-center font-display text-[11px] font-bold text-foreground">
                        {p.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Microphone Hardware Switch & Emoji reactions */}
            <div className="flex flex-col gap-3.5 rounded-2xl border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold text-muted-foreground uppercase">
                  Mic &amp; Stage Reactions
                </span>
                <button
                  onClick={toggleMic}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] font-bold transition-colors ${
                    isMuted
                      ? "border-border bg-background text-muted-foreground"
                      : "border-foreground bg-foreground text-background"
                  }`}
                >
                  {isMuted ? (
                    <RiMicOffLine size={13} />
                  ) : (
                    <RiMicLine size={13} />
                  )}
                  <span>{isMuted ? "Muted" : "Live Input"}</span>
                </button>
              </div>

              <div className="flex items-center justify-between gap-1.5">
                {EMOJI_BURSTS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => triggerReaction(emoji)}
                    className="flex size-9 items-center justify-center rounded-xl border border-border bg-background text-lg shadow-xs transition-colors hover:border-foreground/40 sm:size-10"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Enter Stage Button */}
            <Button
              className="h-11 w-full gap-2 rounded-xl bg-foreground font-mono text-xs font-bold tracking-wider text-background uppercase shadow-sm hover:bg-foreground/90"
              render={<Link href="/lobby" />}
              nativeButton={false}
            >
              <span>Enter Live Stage Room</span>
              <RiArrowRightLine size={16} />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
