"use client"

import { useEffect, useRef, useState } from "react"
import { Users } from "lucide-react"
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion"
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

type RoomCardData = {
  name: string
  title: string
  topic?: string
  speakers: string[]
  listeners?: number
}

// The stack: starter rooms + active community rooms representing real spaces.
const ROOM_CARDS: RoomCardData[] = [
  ...STARTER_TEMPLATES.map((t, idx) => ({
    name: t.name,
    title: t.title,
    topic: t.topic,
    speakers: t.speakers,
    listeners: 14 + ((idx * 7) % 18),
  })),
  {
    name: "late-night-lo-fi",
    title: "Late Night Lo-fi & Focus",
    topic: "Chill & Cowork",
    speakers: ["Afterclap-6", "OSLO-2", "Cranks-1"],
    listeners: 31,
  },
  {
    name: "first-100-users",
    title: "Founder Fireside: First 100 Users",
    topic: "Startups & Growth",
    speakers: ["Funny Bunny-4", "Teamwork-2", "Upstream-1"],
    listeners: 29,
  },
  {
    name: "ai-voice-realtime-agents",
    title: "Real-time AI Voice & Low Latency LLMs",
    topic: "AI Architecture",
    speakers: ["Cranks-2", "OSLO-11", "Afterclap-3"],
    listeners: 42,
  },
  {
    name: "open-source-showcase",
    title: "Open Source Showcase: Next.js & Bun",
    topic: "Engineering",
    speakers: ["Upstream-4", "OSLO-4", "Funny Bunny-1"],
    listeners: 18,
  },
  {
    name: "indie-hackers-revenue",
    title: "Indie Hackers: Pre-revenue to $10k MRR",
    topic: "Bootstrapping",
    speakers: ["No Comments-2", "No gravity-2", "Teamwork-3"],
    listeners: 27,
  },
]

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
        <div className="relative flex w-full justify-center">{children}</div>
      </div>
    </article>
  )
}

// The crowd: decorative grid of people who joined.
function Crowd() {
  return (
    <ul
      aria-hidden="true"
      className="grid w-full max-w-xl grid-cols-8 gap-1.5 [mask-image:linear-gradient(to_bottom,#000_60%,transparent)] sm:grid-cols-10 sm:gap-2"
    >
      {CROWD.map((seed) => (
        <li key={seed} className="aspect-square w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={userpicUrl(seed)}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full rounded-full border border-border bg-muted object-cover select-none"
          />
        </li>
      ))}
    </ul>
  )
}

// Interactive 3D room card in the cylindrical wheel.
function StackCardItem({
  card,
  index,
  total,
  position,
  onCardClick,
}: {
  card: (typeof ROOM_CARDS)[number]
  index: number
  total: number
  position: MotionValue<number>
  onCardClick: (diff: number) => void
}) {
  const half = total / 2

  const y = useTransform(position, (pos) => {
    let d = (index - pos) % total
    if (d < -half) d += total
    if (d > half) d -= total
    return d * 38
  })

  const z = useTransform(position, (pos) => {
    let d = (index - pos) % total
    if (d < -half) d += total
    if (d > half) d -= total
    return -Math.abs(d) * 24
  })

  const rotateX = useTransform(position, (pos) => {
    let d = (index - pos) % total
    if (d < -half) d += total
    if (d > half) d -= total
    return -d * 14
  })

  const scale = useTransform(position, (pos) => {
    let d = (index - pos) % total
    if (d < -half) d += total
    if (d > half) d -= total
    return Math.max(0.76, 1 - Math.abs(d) * 0.065)
  })

  const opacity = useTransform(position, (pos) => {
    let d = (index - pos) % total
    if (d < -half) d += total
    if (d > half) d -= total
    const absD = Math.abs(d)
    if (absD >= 2.2) return 0
    if (absD > 1.8) return (2.2 - absD) / 0.4
    return 1
  })

  const zIndex = useTransform(position, (pos) => {
    let d = (index - pos) % total
    if (d < -half) d += total
    if (d > half) d -= total
    return Math.round(50 - Math.abs(d) * 10)
  })

  const pointerEvents = useTransform(position, (pos) => {
    let d = (index - pos) % total
    if (d < -half) d += total
    if (d > half) d -= total
    return Math.abs(d) <= 1.3 ? ("auto" as const) : ("none" as const)
  })

  return (
    <motion.div
      onClick={(e) => {
        e.stopPropagation()
        let d = (index - position.get()) % total
        if (d < -half) d += total
        if (d > half) d -= total
        onCardClick(d)
      }}
      className="absolute inset-x-0 top-[42px] flex h-[132px] flex-col justify-between rounded-2xl border border-border bg-card p-3.5 text-left shadow-md transition-colors duration-150 will-change-transform select-none hover:border-foreground/25"
      style={{
        y,
        z,
        rotateX,
        scale,
        opacity,
        zIndex,
        pointerEvents,
      }}
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-2 py-0.5 font-mono text-[10px] font-bold tracking-wide text-background uppercase shadow-xs">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
            Live
          </span>
          {card.topic && (
            <span className="truncate font-mono text-[10px] text-muted-foreground/80">
              {card.topic}
            </span>
          )}
        </div>
        <span className="line-clamp-2 font-display text-sm leading-snug text-foreground">
          {card.title}
        </span>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex -space-x-2">
          {card.speakers.map((s) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={s}
              src={userpicUrl(s)}
              alt=""
              className="size-6.5 rounded-full border-2 border-card bg-muted object-cover shadow-xs"
            />
          ))}
        </div>
        {card.listeners !== undefined && (
          <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
            <Users className="size-3" aria-hidden="true" />
            <span>{card.listeners}</span>
          </span>
        )}
      </div>
    </motion.div>
  )
}

// Rooms cylinder wheel: physical scrolling, touch & drag gestures for mobile & desktop,
// momentum flick physics, and spring animations via framer-motion.
function RoomStack() {
  const containerRef = useRef<HTMLDivElement>(null)
  const inView = useInView(containerRef, { margin: "120px" })
  const reducedMotion = useReducedMotion()

  const position = useMotionValue(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const animationControls = useRef<ReturnType<typeof animate> | null>(null)
  const isDraggingRef = useRef(false)
  const dragStartPos = useRef(0)
  const targetIndexRef = useRef(0)
  const lastInteractionTime = useRef(0)
  const lastWheelTime = useRef(0)
  const total = ROOM_CARDS.length

  // Track active index for a11y & indicator dots
  useMotionValueEvent(position, "change", (latest) => {
    const raw = Math.round(latest)
    const norm = ((raw % total) + total) % total
    setActiveIndex(norm)
  })

  const animateTo = (target: number, velocity = 0) => {
    animationControls.current?.stop()
    targetIndexRef.current = target
    lastInteractionTime.current = Date.now()

    if (reducedMotion) {
      position.set(target)
      return
    }

    animationControls.current = animate(position, target, {
      type: "spring",
      stiffness: 190,
      damping: 24,
      mass: 0.8,
      restDelta: 0.001,
      velocity,
    })
  }

  // Smooth auto-advance when in view & idle
  useEffect(() => {
    lastInteractionTime.current = Date.now()
    if (reducedMotion) return

    const interval = setInterval(() => {
      const isIdle = Date.now() - lastInteractionTime.current > 2600
      if (inView && !isHovered && !isDraggingRef.current && isIdle) {
        animateTo(targetIndexRef.current + 1)
      }
    }, 2800)

    return () => clearInterval(interval)
  }, [inView, isHovered, reducedMotion])

  // Handle card click
  const handleCardClick = (diff: number) => {
    if (Math.abs(diff) < 0.4) {
      animateTo(targetIndexRef.current + 1)
    } else {
      animateTo(targetIndexRef.current + Math.round(diff))
    }
  }

  // Handle wheel / trackpad scroll
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now()
    lastInteractionTime.current = now
    if (Math.abs(e.deltaY) > 8 && now - lastWheelTime.current > 160) {
      lastWheelTime.current = now
      const dir = e.deltaY > 0 ? 1 : -1
      animateTo(targetIndexRef.current + dir)
    }
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault()
      animateTo(targetIndexRef.current + 1)
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault()
      animateTo(targetIndexRef.current - 1)
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault()
      animateTo(targetIndexRef.current + 1)
    }
  }

  const PIXELS_PER_CARD = 54

  return (
    <motion.div
      ref={containerRef}
      role="region"
      tabIndex={0}
      aria-label={`Live rooms stack. Currently showing: ${ROOM_CARDS[activeIndex].title}.`}
      onKeyDown={handleKeyDown}
      onWheel={handleWheel}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      onPanStart={() => {
        animationControls.current?.stop()
        isDraggingRef.current = true
        dragStartPos.current = position.get()
        lastInteractionTime.current = Date.now()
      }}
      onPan={(_, info) => {
        lastInteractionTime.current = Date.now()
        const newPos = dragStartPos.current - info.offset.y / PIXELS_PER_CARD
        position.set(newPos)
      }}
      onPanEnd={(_, info) => {
        isDraggingRef.current = false
        lastInteractionTime.current = Date.now()

        const current = position.get()
        const cardVelocity = -info.velocity.y / PIXELS_PER_CARD
        const projection = Math.max(-2, Math.min(2, cardVelocity * 0.12))
        const target = Math.round(current + projection)
        animateTo(target, cardVelocity)
      }}
      style={{
        touchAction: "none",
        perspective: 850,
        transformStyle: "preserve-3d",
      }}
      className="relative flex h-[216px] w-full max-w-64 cursor-grab items-center justify-center rounded-2xl select-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:cursor-grabbing"
    >
      {ROOM_CARDS.map((card, i) => (
        <StackCardItem
          key={card.name}
          card={card}
          index={i}
          total={total}
          position={position}
          onCardClick={handleCardClick}
        />
      ))}
    </motion.div>
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
      <span className="flex items-center gap-2 rounded-full border border-border/70 bg-card px-3.5 py-2 font-mono text-xs font-bold tracking-wide text-muted-foreground uppercase shadow-xs">
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
                {COUNTRY.sessions} sessions).
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
            stat={`${MINUTES.toLocaleString("en-US")} minutes`}
            label={`on the mic. ${Math.round(MINUTES / 60)} hours of people talking.`}
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
