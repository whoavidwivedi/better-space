"use client"

import { useRef } from "react"
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  useInView,
} from "framer-motion"

const UNIQUE_PARTICIPANTS = {
  value: "266",
  spark: [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 8, 22, 9, 4, 7, 3, 10, 2, 5, 1,
    4, 2, 6,
  ],
}

const TOTAL_ROOMS = {
  value: "157",
  spark: [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 6, 16, 7, 3, 5, 2, 7, 1, 3, 1,
    4, 2, 5,
  ],
}

const CONNECTION_SUCCESS = {
  value: "99.8%",
  past: [98.9, 99.1, 99.0, 99.2, 99.1, 99.3],
  recent: [99.3, 99.5, 99.7, 99.8],
}

const PLATFORMS = [
  { label: "MacOS", value: 70.1 },
  { label: "iOS", value: 19.9 },
  { label: "Android", value: 9 },
  { label: "Linux", value: 0.9 },
  { label: "Windows", value: 0.2 },
]

const CONNECTION_TYPES = [
  { label: "UDP", value: 99.1 },
  { label: "TCP", value: 0.9 },
]

const TOP_COUNTRIES = [{ rank: 1, name: "India", count: "443" }]

const PARTICIPANT_MINUTES = {
  value: "5,118",
  unit: "min",
}

const PASTEL_COLORS = [
  "#c4b5fd", // Violet 300
  "#93c5fd", // Blue 300
  "#6ee7b7", // Emerald 300
  "#f9a8d4", // Pink 300
  "#fcd34d", // Amber 300
]

const PASTEL_RGB = [
  "196, 181, 253", // Violet 300
  "147, 197, 253", // Blue 300
  "110, 231, 183", // Emerald 300
  "249, 168, 212", // Pink 300
  "252, 211, 77", // Amber 300
]

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.95, filter: "blur(2px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring" as const,
      stiffness: 350,
      damping: 25,
      mass: 0.8,
    },
  },
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] font-bold tracking-[0.22em] text-muted-foreground uppercase">
      {children}
    </p>
  )
}

function StatCard({
  label,
  children,
  className = "",
  glowColor = "150, 150, 150",
}: {
  label: string
  children: React.ReactNode
  className?: string
  glowColor?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Spring configuration based on Emil's guide (smooth, physical)
  const springX = useSpring(mouseX, { stiffness: 300, damping: 30 })
  const springY = useSpring(mouseY, { stiffness: 300, damping: 30 })

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <motion.div
      ref={ref}
      variants={itemVariants}
      onMouseMove={handleMouseMove}
      whileTap={{ scale: 0.98 }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card/50 p-5 transition-colors duration-200 ease-out hover:border-foreground/25 sm:p-6 ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              300px circle at ${springX}px ${springY}px,
              rgba(${glowColor}, 0.15),
              transparent 100%
            )
          `,
        }}
      />
      <div className="relative z-10 flex h-full flex-col">
        <CardLabel>{label}</CardLabel>
        {children}
      </div>
    </motion.div>
  )
}

const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

function BigStat({ value, unit }: { value: string; unit?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  const chars = value.split("")

  return (
    <p
      ref={ref}
      className="flex items-baseline gap-1.5 font-display text-4xl leading-none font-black tracking-tight text-foreground sm:text-5xl"
    >
      <span className="inline-flex items-baseline tabular-nums">
        {chars.map((char, i) => {
          const isDigit = !isNaN(parseInt(char))

          if (!isDigit) {
            return (
              <span key={`${i}-${char}`} className="inline-block">
                {char}
              </span>
            )
          }

          const numValue = parseInt(char)
          // Add 10 to ensure it does at least one full rotation
          const targetIndex = 10 + numValue

          return (
            <span
              key={`${i}-${char}`}
              className="relative inline-flex h-[1em] overflow-hidden leading-[1em]"
            >
              <span className="invisible">0</span>
              <motion.span
                initial={{ y: 0 }}
                animate={isInView ? { y: `-${targetIndex}em` } : { y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 150,
                  damping: 22,
                  mass: 1,
                  delay: 0.1 + i * 0.08,
                }}
                className="absolute inset-x-0 top-0 flex flex-col items-center"
              >
                {NUMBERS.map((num, idx) => (
                  <span key={idx} className="h-[1em] leading-[1em]">
                    {num}
                  </span>
                ))}
              </motion.span>
            </span>
          )
        })}
      </span>
      {unit && (
        <span className="text-base font-bold text-muted-foreground sm:text-lg">
          {unit}
        </span>
      )}
    </p>
  )
}

function Sparkline({
  data,
  gradientId,
  colorIndex = 0,
}: {
  data: number[]
  gradientId: string
  colorIndex?: number
}) {
  const w = 100
  const h = 36
  const max = Math.max(...data) || 1
  const step = w / Math.max(data.length - 1, 1)

  const pathD = data
    .map((v, i) => {
      const x = (i * step).toFixed(2)
      const y = (h - 3 - (v / max) * (h - 8)).toFixed(2)
      return `${i === 0 ? "M" : "L"} ${x} ${y}`
    })
    .join(" ")

  const polygonD = `${pathD} L ${w} ${h} L 0 ${h} Z`
  const color = PASTEL_COLORS[colorIndex % PASTEL_COLORS.length]

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="mt-auto h-14 w-full"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
        viewport={{ once: true }}
        d={polygonD}
        fill={`url(#${gradientId})`}
      />
      <motion.path
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.32, 0.72, 0, 1] }}
        viewport={{ once: true }}
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Donut({
  segments,
  colorIndex = 0,
}: {
  segments: { label: string; value: number }[]
  colorIndex?: number
}) {
  const arcs = segments.map((s, i) => ({
    ...s,
    dashOffset:
      25 - segments.slice(0, i).reduce((sum, prev) => sum + prev.value, 0),
  }))

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 42 42"
      className="size-24 shrink-0 sm:size-28"
    >
      <circle
        cx="21"
        cy="21"
        r="15.9155"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.08"
        strokeWidth="5.5"
      />
      {arcs.map((arc, i) => {
        const dashArray = `${Math.max(arc.value, 0.5)} ${100 - Math.max(arc.value, 0.5)}`
        const color = PASTEL_COLORS[(colorIndex + i) % PASTEL_COLORS.length]
        return (
          <motion.circle
            key={arc.label}
            cx="21"
            cy="21"
            r="15.9155"
            fill="none"
            stroke={color}
            strokeWidth="5.5"
            strokeDasharray={dashArray}
            strokeDashoffset={arc.dashOffset}
            initial={{ opacity: 0, scale: 0.9, originX: "50%", originY: "50%" }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.2 + i * 0.1,
              ease: [0.32, 0.72, 0, 1], // iOS drawer curve
            }}
            viewport={{ once: true }}
          />
        )
      })}
    </svg>
  )
}

function DonutLegend({
  segments,
  colorIndex = 0,
}: {
  segments: { label: string; value: number }[]
  colorIndex?: number
}) {
  return (
    <ul className="space-y-1.5 font-mono text-xs">
      {segments.map((s, i) => {
        const color = PASTEL_COLORS[(colorIndex + i) % PASTEL_COLORS.length]
        return (
          <motion.li
            key={s.label}
            initial={{ opacity: 0, x: -5 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.4,
              delay: 0.3 + i * 0.05,
              ease: "easeOut",
            }}
            viewport={{ once: true }}
            className="flex items-center gap-2"
          >
            <span
              aria-hidden="true"
              className="size-2 shrink-0 rounded-[2px]"
              style={{ backgroundColor: color }}
            />
            <span className="text-muted-foreground">{s.label}</span>
            <span className="ml-auto text-foreground tabular-nums">
              {s.value}%
            </span>
          </motion.li>
        )
      })}
    </ul>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

export function SpaceStats() {
  return (
    <section className="relative w-full border-b border-border/80 bg-background py-16 sm:py-20 md:py-24">
      {/* Subtle grid backdrop, same treatment as hero */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_60%,transparent_100%)] bg-[size:4rem_4rem] opacity-30" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
      >
        {/* Section header */}
        <motion.div
          variants={itemVariants}
          className="mb-10 max-w-2xl sm:mb-14"
        >
          <p className="font-mono text-[10px] font-bold tracking-[0.22em] text-muted-foreground uppercase">
            Telemetry // Past 60 days
          </p>
          <h2 className="mt-4 font-display text-3xl leading-[1.05] font-black tracking-tight text-foreground sm:text-4xl md:text-5xl">
            The network,{" "}
            <span className="font-serif-display font-normal text-muted-foreground italic">
              in numbers.
            </span>
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
            Aggregated straight from our LiveKit infrastructure — every room,
            listener, and reconnection since launch.
          </p>
        </motion.div>

        {/* Sessions */}
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard label="Unique Participants" glowColor={PASTEL_RGB[0]}>
            <div className="flex flex-1 items-center justify-center py-6">
              <BigStat value={UNIQUE_PARTICIPANTS.value} />
            </div>
            <Sparkline
              data={UNIQUE_PARTICIPANTS.spark}
              gradientId="spark-participants"
              colorIndex={0}
            />
          </StatCard>

          <StatCard label="Total Rooms" glowColor={PASTEL_RGB[1]}>
            <div className="flex flex-1 items-center justify-center py-6">
              <BigStat value={TOTAL_ROOMS.value} />
            </div>
            <Sparkline
              data={TOTAL_ROOMS.spark}
              gradientId="spark-rooms"
              colorIndex={1}
            />
          </StatCard>
        </div>

        {/* Connection quality */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Connection Success" glowColor={PASTEL_RGB[2]}>
            <div className="flex flex-1 items-center justify-center py-6">
              <BigStat value={CONNECTION_SUCCESS.value} />
            </div>
            <Sparkline
              data={[...CONNECTION_SUCCESS.past, ...CONNECTION_SUCCESS.recent]}
              gradientId="spark-success"
              colorIndex={2}
            />
          </StatCard>

          <StatCard label="Platforms" glowColor={PASTEL_RGB[3]}>
            <div className="flex flex-1 items-center justify-center py-6">
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
                <Donut segments={PLATFORMS} colorIndex={3} />
                <DonutLegend segments={PLATFORMS} colorIndex={3} />
              </div>
            </div>
          </StatCard>

          <StatCard label="Connection Type" glowColor={PASTEL_RGB[4]}>
            <div className="flex flex-1 items-center justify-center py-6">
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
                <Donut segments={CONNECTION_TYPES} colorIndex={4} />
                <DonutLegend segments={CONNECTION_TYPES} colorIndex={4} />
              </div>
            </div>
          </StatCard>

          <StatCard label="Top Countries" glowColor={PASTEL_RGB[0]}>
            <div className="flex flex-1 items-center py-6">
              <div className="w-full overflow-hidden rounded-lg border border-border/60">
                <div className="grid grid-cols-[1.75rem_1fr_auto] gap-2 bg-muted/40 px-3 py-2 font-mono text-[9px] font-bold tracking-[0.18em] text-muted-foreground uppercase">
                  <span>#</span>
                  <span>Name</span>
                  <span>Count</span>
                </div>
                {TOP_COUNTRIES.map((c, i) => (
                  <motion.div
                    key={c.rank}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.3 + i * 0.05,
                      ease: "easeOut",
                    }}
                    viewport={{ once: true }}
                    className="grid grid-cols-[1.75rem_1fr_auto] gap-2 border-t border-border/40 px-3 py-2.5 text-sm"
                  >
                    <span className="font-mono text-xs text-muted-foreground">
                      {c.rank}
                    </span>
                    <span>{c.name}</span>
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">
                      {c.count}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </StatCard>
        </div>

        {/* Participant minutes */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <StatCard
            label="WebRTC Participant Minutes"
            glowColor={PASTEL_RGB[1]}
          >
            <div className="flex flex-1 items-center justify-center py-8">
              <BigStat
                value={PARTICIPANT_MINUTES.value}
                unit={PARTICIPANT_MINUTES.unit}
              />
            </div>
          </StatCard>

          <StatCard
            label="Participant Minutes by Kind"
            glowColor={PASTEL_RGB[2]}
          >
            <div className="flex flex-1 flex-wrap items-center justify-center gap-x-5 gap-y-3 py-8">
              <Donut
                segments={[{ label: "WebRTC", value: 100 }]}
                colorIndex={2}
              />
              <motion.p
                initial={{ opacity: 0, x: -5 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
                viewport={{ once: true }}
                className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs"
              >
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: PASTEL_COLORS[2] }}
                />
                <span className="text-muted-foreground">
                  WebRTC participant minutes
                </span>
                <span className="text-foreground tabular-nums">5,118 min</span>
              </motion.p>
            </div>
          </StatCard>
        </div>
      </motion.div>
    </section>
  )
}
