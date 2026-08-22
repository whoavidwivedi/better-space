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

/* Monochrome segment shades, darkest = largest share */
const SHADES = [0.95, 0.65, 0.45, 0.3, 0.18]

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
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border border-border bg-card/50 p-5 transition-colors hover:border-foreground/25 sm:p-6 ${className}`}
    >
      <CardLabel>{label}</CardLabel>
      {children}
    </div>
  )
}

function BigStat({ value, unit }: { value: string; unit?: string }) {
  return (
    <p className="flex items-baseline gap-1.5 font-display text-4xl leading-none font-black tracking-tight text-foreground sm:text-5xl">
      {value}
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
}: {
  data: number[]
  gradientId: string
}) {
  const w = 100
  const h = 36
  const max = Math.max(...data) || 1
  const step = w / Math.max(data.length - 1, 1)
  const points = data.map(
    (v, i) =>
      `${(i * step).toFixed(2)},${(h - 3 - (v / max) * (h - 8)).toFixed(2)}`
  )

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="mt-auto h-14 w-full text-foreground"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${points.join(" ")} ${w},${h}`}
        fill={`url(#${gradientId})`}
      />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Donut({ segments }: { segments: { label: string; value: number }[] }) {
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
        strokeOpacity="0.12"
        strokeWidth="5.5"
      />
      {arcs.map((arc, i) => (
        <circle
          key={arc.label}
          cx="21"
          cy="21"
          r="15.9155"
          fill="none"
          stroke="currentColor"
          strokeOpacity={SHADES[i]}
          strokeWidth="5.5"
          strokeDasharray={`${Math.max(arc.value, 0.5)} ${100 - Math.max(arc.value, 0.5)}`}
          strokeDashoffset={arc.dashOffset}
        />
      ))}
    </svg>
  )
}

function DonutLegend({
  segments,
}: {
  segments: { label: string; value: number }[]
}) {
  return (
    <ul className="space-y-1.5 font-mono text-xs">
      {segments.map((s, i) => (
        <li key={s.label} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="size-2 shrink-0 rounded-[2px] bg-foreground"
            style={{ opacity: SHADES[i] }}
          />
          <span className="text-muted-foreground">{s.label}</span>
          <span className="ml-auto text-foreground tabular-nums">
            {s.value}%
          </span>
        </li>
      ))}
    </ul>
  )
}

export function SpaceStats() {
  return (
    <section className="relative w-full border-b border-border/80 bg-background py-16 sm:py-20 md:py-24">
      {/* Subtle grid backdrop, same treatment as hero */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_60%,transparent_100%)] bg-[size:4rem_4rem] opacity-30" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-10 max-w-2xl sm:mb-14">
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
        </div>

        {/* Sessions */}
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard label="Unique Participants">
            <div className="flex flex-1 items-center justify-center py-6">
              <BigStat value={UNIQUE_PARTICIPANTS.value} />
            </div>
            <Sparkline
              data={UNIQUE_PARTICIPANTS.spark}
              gradientId="spark-participants"
            />
          </StatCard>

          <StatCard label="Total Rooms">
            <div className="flex flex-1 items-center justify-center py-6">
              <BigStat value={TOTAL_ROOMS.value} />
            </div>
            <Sparkline data={TOTAL_ROOMS.spark} gradientId="spark-rooms" />
          </StatCard>
        </div>

        {/* Connection quality */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Connection Success">
            <div className="flex flex-1 items-center justify-center py-6">
              <BigStat value={CONNECTION_SUCCESS.value} />
            </div>
            <Sparkline
              data={[...CONNECTION_SUCCESS.past, ...CONNECTION_SUCCESS.recent]}
              gradientId="spark-success"
            />
          </StatCard>

          <StatCard label="Platforms">
            <div className="flex flex-1 items-center justify-center py-6">
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
                <Donut segments={PLATFORMS} />
                <DonutLegend segments={PLATFORMS} />
              </div>
            </div>
          </StatCard>

          <StatCard label="Connection Type">
            <div className="flex flex-1 items-center justify-center py-6">
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
                <Donut segments={CONNECTION_TYPES} />
                <DonutLegend segments={CONNECTION_TYPES} />
              </div>
            </div>
          </StatCard>

          <StatCard label="Top Countries">
            <div className="flex flex-1 items-center py-6">
              <div className="w-full overflow-hidden rounded-lg border border-border/60">
                <div className="grid grid-cols-[1.75rem_1fr_auto] gap-2 bg-muted/40 px-3 py-2 font-mono text-[9px] font-bold tracking-[0.18em] text-muted-foreground uppercase">
                  <span>#</span>
                  <span>Name</span>
                  <span>Count</span>
                </div>
                {TOP_COUNTRIES.map((c) => (
                  <div
                    key={c.rank}
                    className="grid grid-cols-[1.75rem_1fr_auto] gap-2 border-t border-border/40 px-3 py-2.5 text-sm"
                  >
                    <span className="font-mono text-xs text-muted-foreground">
                      {c.rank}
                    </span>
                    <span>{c.name}</span>
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">
                      {c.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </StatCard>
        </div>

        {/* Participant minutes */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <StatCard label="WebRTC Participant Minutes">
            <div className="flex flex-1 items-center justify-center py-8">
              <BigStat
                value={PARTICIPANT_MINUTES.value}
                unit={PARTICIPANT_MINUTES.unit}
              />
            </div>
          </StatCard>

          <StatCard label="Participant Minutes by Kind">
            <div className="flex flex-1 flex-wrap items-center justify-center gap-x-5 gap-y-3 py-8">
              <Donut segments={[{ label: "WebRTC", value: 100 }]} />
              <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs">
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 rounded-[2px] bg-foreground"
                />
                <span className="text-muted-foreground">
                  WebRTC participant minutes
                </span>
                <span className="text-foreground tabular-nums">5,118 min</span>
              </p>
            </div>
          </StatCard>
        </div>
      </div>
    </section>
  )
}
