/* eslint-disable @next/next/no-img-element */
"use client"

import React from "react"
import Link from "next/link"
import { ArrowRight as RiArrowRightLine } from "lucide-react"
import { userpicUrl } from "@/lib/userpics"
import { Button } from "@/components/ui/button"

const DEMO_SPEAKERS = [
  { id: "sora", name: "Sora", role: "Host", avatar: "OSLO-1" },
  { id: "elena", name: "Elena", role: "Speaker", avatar: "OSLO-3" },
  { id: "marcus", name: "Marcus", role: "Speaker", avatar: "Upstream-2" },
  { id: "kai", name: "Kai", role: "Speaker", avatar: "Afterclap-4" },
  { id: "maya", name: "Maya", role: "Speaker", avatar: "Funny Bunny-1" },
]

export function LiveStageHero() {
  return (
    <section className="relative w-full border-b border-border/80 bg-background pt-6 pb-12 sm:pt-10 sm:pb-16 md:pt-14 md:pb-24">
      {/* Background Atmosphere Subtle Grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:4rem_4rem] opacity-35" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Top Product Badge */}
        <div className="mb-5 flex justify-center sm:mb-6">
          <div className="inline-flex max-w-full items-center rounded-full border border-border bg-card/80 px-3 py-1 text-center shadow-xs backdrop-blur-md sm:px-4 sm:py-1.5">
            <span className="truncate font-mono text-[10px] font-semibold tracking-wide text-foreground sm:text-xs">
              LIVE SPATIAL AUDIO • ZERO LOGINS • 100% EPHEMERAL
            </span>
          </div>
        </div>

        {/* Core Headline */}
        <div className="mx-auto mb-6 max-w-3xl text-center sm:mb-8 md:mb-10">
          <h1 className="font-display text-2xl leading-[1.15] font-extrabold tracking-tight text-foreground sm:text-4xl sm:leading-[1.1] md:text-5xl lg:text-6xl">
            Voice spaces for{" "}
            <span className="font-serif font-normal text-muted-foreground italic">
              real-time
            </span>{" "}
            conversations.
          </h1>
          <p className="mx-auto mt-2.5 max-w-xl px-2 text-xs leading-relaxed font-normal text-muted-foreground sm:mt-3.5 sm:text-sm md:text-base">
            Drop into live voice rooms directly in your browser. Claim the mic
            and talk with crisp WebRTC audio. No accounts, no passwords, 100%
            ephemeral.
          </p>
        </div>

        {/* Live Stage Preview Card */}
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border bg-card/90 p-4 shadow-xl backdrop-blur-md sm:rounded-3xl sm:p-6 md:p-8">
          {/* Stage Room Header */}
          <div className="flex flex-col justify-between gap-2.5 border-b border-border/70 pb-3 sm:flex-row sm:items-center sm:gap-3 sm:pb-4">
            <div>
              <h3 className="font-display text-sm font-bold text-foreground sm:text-base md:text-lg">
                Design &amp; Engineering Stage
              </h3>
              <span className="font-mono text-[10px] text-muted-foreground sm:text-xs">
                5 on stage • 42 listeners tuning in
              </span>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button
                variant="outline"
                className="h-8 gap-1.5 rounded-xl font-mono text-[10px] font-bold tracking-wider text-foreground uppercase shadow-xs hover:bg-muted"
                render={<Link href="/lobby" />}
                nativeButton={false}
              >
                <span>Browse All Rooms</span>
                <RiArrowRightLine size={13} />
              </Button>
            </div>
          </div>

          {/* Speakers Stage Layout */}
          <div className="relative flex w-full items-center justify-center py-5 sm:py-8 md:py-10">
            {/* Speakers Circle Layout - Responsive 5 columns */}
            <div className="relative z-10 grid w-full max-w-2xl grid-cols-5 justify-items-center gap-1.5 px-1 sm:gap-3 md:gap-6">
              {DEMO_SPEAKERS.map((speaker) => (
                <div
                  key={speaker.id}
                  className="flex min-w-0 flex-col items-center text-center"
                >
                  {/* Avatar Container */}
                  <div className="relative size-12 sm:size-16 md:size-20">
                    <div className="size-full overflow-hidden rounded-full border-2 border-border/80 bg-muted shadow-xs">
                      <img
                        src={userpicUrl(speaker.avatar)}
                        alt={speaker.name}
                        className="size-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Name & Role */}
                  <div className="mt-1 w-full sm:mt-2">
                    <span className="block truncate font-display text-[10px] font-bold text-foreground sm:text-xs">
                      {speaker.name}
                    </span>
                    <span className="block truncate font-mono text-[8px] text-muted-foreground sm:text-[10px]">
                      {speaker.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lobby Action */}
        <div className="mt-6 flex justify-center sm:mt-8">
          <Button
            className="h-11 gap-2 rounded-xl bg-foreground px-7 font-mono text-xs font-bold tracking-wider text-background uppercase shadow-sm hover:bg-foreground/90"
            render={<Link href="/lobby" />}
            nativeButton={false}
          >
            <span>Lobby</span>
            <RiArrowRightLine
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Button>
        </div>
      </div>
    </section>
  )
}
