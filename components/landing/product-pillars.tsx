/* eslint-disable @next/next/no-img-element */
"use client"

import React from "react"
import {
  RiShieldCheckLine,
  RiSpeedLine,
  RiUserVoiceLine,
  RiLock2Line,
  RiTerminalBoxLine,
  RiVolumeUpLine,
} from "@remixicon/react"

const PILLARS = [
  {
    icon: RiUserVoiceLine,
    title: "Zero Logins & No Passwords",
    description:
      "No account creation, no password resets, and no email verification. Choose your handle to jump straight into conversation.",
    badge: "Frictionless",
  },
  {
    icon: RiSpeedLine,
    title: "Sub-35ms WebRTC Engine",
    description:
      "Powered by distributed WebRTC Selective Forwarding Units (SFU) with browser-native acoustic echo cancellation and automatic gain control.",
    badge: "Ultra Low Latency",
  },
  {
    icon: RiShieldCheckLine,
    title: "100% Ephemeral Voice Rooms",
    description:
      "When the last participant disconnects, the space self-terminates. No room history is retained, no audio tracks are recorded, and no logs are saved.",
    badge: "Complete Privacy",
  },
]

export function ProductPillars() {
  return (
    <section id="technology" className="relative w-full border-b border-border/80 bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
            ARCHITECTURE &amp; PRINCIPLES
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mt-2">
            Engineered for pure, immediate voice.
          </h2>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base font-normal">
            Stripped of corporate bloat and surveillance metrics. Built for high-fidelity spoken dialogue.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon
            return (
              <div
                key={idx}
                className="relative flex flex-col justify-between rounded-3xl border border-border bg-card/60 p-7 sm:p-8 backdrop-blur-sm shadow-xs hover:border-foreground/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-6">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-muted border border-border text-foreground">
                      <Icon size={22} />
                    </div>
                    <span className="rounded-full bg-muted/80 px-3 py-1 font-mono text-[10px] font-bold text-muted-foreground uppercase">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-foreground mb-2.5">
                    {pillar.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-border/50 font-mono text-xs font-bold text-muted-foreground flex items-center gap-2">
                  <span>Production Ready</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
