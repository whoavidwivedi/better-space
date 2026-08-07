/* eslint-disable @next/next/no-img-element */
"use client"

import { RiMicLine, RiMicOffLine, RiArrowRightLine } from "@remixicon/react"
import Link from "next/link"
import React, { useState, useEffect } from "react"

import {
  DoodleArrow,
  DoodleCurlyArrow,
  DoodleCircle,
  DoodleSparkle,
  DoodleUnderline,
  DoodleAsterisk,
} from "@/components/common/doodles"
import { userpicUrl, getCharacterCollection } from "@/lib/userpics"
import { sound } from "@/lib/sound"

const DEMO_CHARACTERS = [
  {
    id: "oslo-1",
    name: "Avery",
    role: "Host",
    statusText: "Can everyone hear the 48kHz audio stream?",
    avatar: "OSLO-1",
    collection: "OSLO Studio",
  },
  {
    id: "upstream-1",
    name: "Kaito",
    role: "Speaker",
    statusText: "Crystal clear. Zero latency from Tokyo.",
    avatar: "Upstream-1",
    collection: "Upstream",
  },
  {
    id: "afterclap-1",
    name: "Sasha",
    role: "Speaker",
    statusText: "No logins, pure voice. Love this interface.",
    avatar: "Afterclap-1",
    collection: "Afterclap",
  },
]

const EMOJI_BURSTS = ["🎙️", "✨", "🔥", "👏", "⚡"]

export function InteractiveHeroStage() {
  const [activeSpeakerIdx, setActiveSpeakerIdx] = useState(0)
  const [isMicMuted, setIsMicMuted] = useState(false)
  const [activeCharacterSeed, setActiveCharacterSeed] = useState("OSLO-1")
  const [reactions, setReactions] = useState<
    { id: number; emoji: string; x: number }[]
  >([])

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSpeakerIdx((prev) => {
        const next = (prev + 1) % DEMO_CHARACTERS.length
        setActiveCharacterSeed(DEMO_CHARACTERS[next].avatar)
        return next
      })
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  const triggerReaction = (emoji: string) => {
    sound.playReaction(emoji)
    const newReaction = {
      id: Date.now() + Math.random(),
      emoji,
      x: Math.floor(Math.random() * 50) + 25,
    }
    setReactions((prev) => [...prev.slice(-6), newReaction])
  }

  const toggleMic = () => {
    const next = !isMicMuted
    setIsMicMuted(next)
    sound.playMicToggle(next)
  }

  const currentSpeaker = DEMO_CHARACTERS[activeSpeakerIdx]
  const currentCollection = getCharacterCollection(activeCharacterSeed)

  return (
    <div className="relative mx-auto w-full max-w-5xl py-8">
      {/* Minimal Stage Frame */}
      <div className="minimal-card relative overflow-hidden rounded-3xl border border-border bg-card/80 p-6 sm:p-12">
        {/* Subtle Doodle Callout Top Right */}
        <div className="pointer-events-none absolute top-6 right-8 hidden items-center gap-2 md:flex">
          <span className="font-handwritten text-base text-muted-foreground">
            Live WebRTC Stage
          </span>
          <DoodleAsterisk className="size-4 text-foreground/50" />
        </div>

        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          {/* Main Giant Character Stage (Left 7 Cols) */}
          <div className="relative flex flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-left">
            {/* Minimal Speech Bubble */}
            <div className="relative mb-6 max-w-md">
              <div className="rounded-2xl border border-border bg-background p-4 shadow-xs sm:p-5">
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    {currentSpeaker.name} • {currentSpeaker.role}
                  </span>
                </div>
                <p className="font-serif-display text-2xl leading-snug text-foreground italic sm:text-3xl">
                  &ldquo;{currentSpeaker.statusText}&rdquo;
                </p>
              </div>
              {/* Pointer */}
              <div className="absolute -bottom-2 left-8 size-3 rotate-45 border-r border-b border-border bg-background sm:left-12" />
            </div>

            {/* Giant Clean Vector Avatar */}
            <div className="relative my-3 flex items-center justify-center">
              {/* Hand-drawn doodle circle */}
              <DoodleCircle className="pointer-events-none absolute -inset-5 size-64 rotate-[-4deg] text-foreground/15 sm:size-72" />

              <div className="relative size-48 rounded-full border border-border bg-background p-2 shadow-xs sm:size-60">
                <img
                  src={userpicUrl(activeCharacterSeed)}
                  alt="Active Character"
                  className="size-full rounded-full object-cover"
                />

                {/* Minimal Equalizer Waveform Pill */}
                {!isMicMuted && (
                  <div className="absolute right-2 bottom-2 flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1 text-background shadow-xs">
                    <div className="flex h-3 items-end gap-0.5">
                      <span className="animate-eq-1 w-0.5 rounded-full bg-background" />
                      <span className="animate-eq-2 w-0.5 rounded-full bg-background" />
                      <span className="animate-eq-3 w-0.5 rounded-full bg-background" />
                      <span className="animate-eq-4 w-0.5 rounded-full bg-background" />
                    </div>
                    <span className="font-mono text-[9px] font-bold tracking-widest uppercase">
                      SPEAKING
                    </span>
                  </div>
                )}
              </div>

              {/* Floating Reaction Stream */}
              <div className="pointer-events-none absolute inset-0 overflow-visible">
                {reactions.map((r) => (
                  <div
                    key={r.id}
                    className="animate-reaction-drift absolute text-3xl select-none"
                    style={{ left: `${r.x}%`, top: "20%" }}
                  >
                    {r.emoji}
                  </div>
                ))}
              </div>
            </div>

            {/* Minimal Handwritten Annotation */}
            <div className="mt-3 flex items-center gap-2">
              <DoodleArrow className="hidden size-6 -rotate-12 text-foreground/60 sm:block" />
              <span className="font-handwritten text-lg text-foreground">
                Current persona:{" "}
                <strong className="font-sans font-bold">
                  {activeCharacterSeed}
                </strong>
              </span>
            </div>
          </div>

          {/* Right Column: Clean Cast Selection & Reactions (5 Cols) */}
          <div className="flex flex-col gap-6 lg:col-span-5">
            {/* Stage Speakers Swapper */}
            <div className="rounded-2xl border border-border bg-muted/30 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  Switch Persona
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  1 of 96
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {DEMO_CHARACTERS.map((char, idx) => {
                  const isSelected = activeCharacterSeed === char.avatar
                  return (
                    <button
                      key={char.id}
                      onClick={() => {
                        sound.playPop(480 + idx * 60)
                        setActiveCharacterSeed(char.avatar)
                        setActiveSpeakerIdx(idx)
                      }}
                      className={`flex flex-col items-center rounded-xl border p-2.5 transition-colors ${
                        isSelected
                          ? "border-foreground bg-card shadow-xs"
                          : "border-transparent bg-background/50 hover:border-border"
                      }`}
                    >
                      <div className="mb-1.5 size-12 overflow-hidden rounded-full border border-border">
                        <img
                          src={userpicUrl(char.avatar)}
                          alt={char.name}
                          className="size-full object-cover"
                        />
                      </div>
                      <span className="w-full truncate text-center font-display text-xs font-bold text-foreground">
                        {char.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Mic Toggle & Emoji Reactions */}
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  Audio &amp; Reactions
                </span>
                <button
                  onClick={toggleMic}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] font-bold transition-colors ${
                    isMicMuted
                      ? "border-border bg-background text-muted-foreground line-through"
                      : "border-foreground bg-foreground text-background"
                  }`}
                >
                  {isMicMuted ? (
                    <RiMicOffLine size={13} />
                  ) : (
                    <RiMicLine size={13} />
                  )}
                  <span>{isMicMuted ? "Muted" : "Mic Live"}</span>
                </button>
              </div>

              <div className="flex items-center justify-between gap-1.5">
                {EMOJI_BURSTS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => triggerReaction(emoji)}
                    className="flex size-10 items-center justify-center rounded-xl border border-border bg-background text-lg shadow-xs transition-colors hover:border-foreground/40"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Enter CTA */}
            <Link
              href="/lobby"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-foreground font-mono text-xs font-bold tracking-wider text-background uppercase transition-opacity hover:opacity-90"
            >
              <span>Enter Live Stage</span>
              <RiArrowRightLine size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
