"use client"

import { useState } from "react"
import { Users } from "lucide-react"
import { AudioVisualizer } from "@/components/audio-visualizer"
import { STARTER_TEMPLATES } from "@/lib/presets"
import { USERPIC_NAMES, userpicUrl } from "@/lib/userpics"
import { cn } from "@/lib/utils"

// Snapshot from the LiveKit dashboard, past 60 days.
const PEOPLE = 266
const ROOMS = 157
const MINUTES = 5118
const SUCCESS = "99.8%"
const COUNTRY = { name: "India", sessions: 443 }
const TRANSPORT = [
  { label: "UDP", value: "99.1%" },
  { label: "TCP", value: "0.9%" },
]
const PLATFORMS = [
  { label: "macOS", value: 70.1 },
  { label: "iOS", value: 19.9 },
  { label: "Android", value: 9 },
  { label: "Linux & Windows", value: 1.1 },
]

// A spread of the characters people actually joined as.
const CROWD = USERPIC_NAMES.filter((_, i) => i % 2 === 0).slice(0, 40)

// Same cell anatomy as the feature bento: headline number and a line of
// context up top, a piece of the product underneath on a fading dot grid.
function Cell({
  stat,
  label,
  className,
  children,
}: {
  stat: string
  label: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <article className={cn("flex flex-col bg-card", className)}>
      <div className="p-6 pb-2 sm:p-8 sm:pb-2">
        <p className="font-display text-3xl text-foreground tabular-nums sm:text-4xl">
          {stat}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {label}
        </p>
      </div>
      <div className="relative flex min-h-52 flex-1 items-center justify-center overflow-hidden p-6 sm:p-8">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_30%,transparent_100%)] bg-size-[16px_16px]"
        />
        <div className="relative flex w-full justify-center">{children}</div>
      </div>
    </article>
  )
}

// The crowd: tap anyone to send them a wave. Decorative, so it stays out of
// the tab order and the accessibility tree.
function Crowd() {
  const [waved, setWaved] = useState<Record<number, number>>({})

  return (
    <ul
      aria-hidden="true"
      className="grid w-full max-w-xl grid-cols-8 gap-1.5 [mask-image:linear-gradient(to_bottom,#000_60%,transparent)] sm:grid-cols-10 sm:gap-2"
    >
      {CROWD.map((seed, i) => (
        <li key={seed} className="relative">
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setWaved((w) => ({ ...w, [i]: Date.now() }))}
            className="block aspect-square w-full rounded-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={userpicUrl(seed)}
              alt=""
              loading="lazy"
              className="size-full rounded-full border border-border bg-muted object-cover"
            />
          </button>
          {waved[i] && (
            <span
              key={waved[i]}
              aria-hidden="true"
              className="pillar-float pointer-events-none absolute bottom-full left-1/2 text-lg"
            >
              👋
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}

// Rooms as the lobby shows them. Tap the stack to deal the next one.
function RoomStack() {
  const [top, setTop] = useState(0)
  const n = STARTER_TEMPLATES.length

  return (
    <button
      type="button"
      aria-label="Show next room"
      onClick={() => setTop((t) => (t + 1) % n)}
      className="relative h-40 w-full max-w-64 rounded-2xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      {STARTER_TEMPLATES.map((t, i) => {
        const depth = (i - top + n) % n
        return (
          <span
            key={t.name}
            className="absolute inset-x-0 top-0 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-[translate,scale,opacity] duration-(--duration-medium) ease-(--ease-out) motion-reduce:transition-none"
            style={{
              translate: `0 ${depth * 14}px`,
              scale: `${1 - depth * 0.06}`,
              opacity: 1 - depth * 0.3,
              zIndex: n - depth,
            }}
          >
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-foreground px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-wide text-background uppercase">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              Live
            </span>
            <span className="line-clamp-2 font-display text-sm text-foreground">
              {t.title}
            </span>
            <span className="flex -space-x-2">
              {t.speakers.map((s) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={s}
                  src={userpicUrl(s)}
                  alt=""
                  className="size-7 rounded-full border-2 border-card bg-muted object-cover"
                />
              ))}
            </span>
          </span>
        )
      })}
    </button>
  )
}

// The speaker meter from the stage tiles, at poster size.
function OnAir() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={userpicUrl("Funny Bunny-3")}
        alt=""
        className="size-12 rounded-full border border-border bg-muted object-cover"
      />
      <div>
        <p className="text-xs font-bold text-foreground">maya</p>
        <p className="font-mono text-[10px] text-muted-foreground">Speaker</p>
        <div className="mt-1.5 w-20">
          <AudioVisualizer volume={0.5} speaking />
        </div>
      </div>
    </div>
  )
}

// The room header's connection pill, plus how the audio got there.
function Connection() {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="flex items-center gap-2 rounded-full border border-border/70 bg-muted/50 px-3.5 py-2 font-mono text-xs font-bold tracking-wide text-muted-foreground uppercase">
        <span className="size-2 rounded-full bg-emerald-500" />
        Connected
      </span>
      <div className="flex gap-2">
        {TRANSPORT.map((t) => (
          <span
            key={t.label}
            className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground tabular-nums"
          >
            <span className="font-medium text-foreground">{t.label}</span>{" "}
            {t.value}
          </span>
        ))}
      </div>
    </div>
  )
}

// Devices as pills filled to their share.
function Platforms() {
  return (
    <ul className="flex w-full max-w-64 flex-col gap-2">
      {PLATFORMS.map((p) => (
        <li
          key={p.label}
          className="relative overflow-hidden rounded-full border border-border bg-card px-3.5 py-1.5 text-xs"
        >
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-0 bg-muted"
            style={{ width: `${p.value}%` }}
          />
          <span className="relative flex justify-between gap-2">
            <span className="font-medium text-foreground">{p.label}</span>
            <span className="text-muted-foreground tabular-nums">
              {p.value}%
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}

export function SpaceStats() {
  return (
    <section className="relative w-full border-b border-border/80 bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
          <span className="font-mono text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            The last 60 days
          </span>
          <h2 className="mt-3 font-display text-3xl tracking-tight text-foreground sm:text-4xl md:text-5xl">
            The network, in numbers.
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Straight from our LiveKit dashboard. Real people, real rooms.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-6">
          <Cell
            stat={`${PEOPLE} people`}
            label={
              <>
                <Users
                  className="mr-1 inline size-3.5 align-[-2px]"
                  aria-hidden="true"
                />
                joined a room, most of them from {COUNTRY.name} (
                {COUNTRY.sessions} sessions). Tap someone to wave.
              </>
            }
            className="sm:col-span-2 lg:col-span-4"
          >
            <Crowd />
          </Cell>
          <Cell
            stat={`${ROOMS} rooms`}
            label="opened, about 1.7 people in each."
            className="sm:col-span-2 lg:col-span-2"
          >
            <RoomStack />
          </Cell>
          <Cell
            stat={`${Math.round(MINUTES / 60)} hours`}
            label={`on the mic. ${MINUTES.toLocaleString("en-US")} minutes of people talking.`}
            className="lg:col-span-2"
          >
            <OnAir />
          </Cell>
          <Cell
            stat={SUCCESS}
            label="of connections worked first time."
            className="lg:col-span-2"
          >
            <Connection />
          </Cell>
          <Cell
            stat="Any device"
            label="Mostly Macs, then phones."
            className="sm:col-span-2 lg:col-span-2"
          >
            <Platforms />
          </Cell>
        </div>
      </div>
    </section>
  )
}
