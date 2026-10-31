import { cn } from "@/lib/utils"

// A 3D receding dot grid: large, bright dots in the centre that smoothly
// scale down and fade out toward the edges and far corners.
const SPACING = 26
const HALF_W = 370
const HALF_H = 170

const DOTS: { x: number; y: number; r: number; opacity: number }[] = []

for (let x = -HALF_W; x <= HALF_W; x += SPACING) {
  for (let y = -HALF_H; y <= HALF_H; y += SPACING) {
    const dx = x / HALF_W
    const dy = y / HALF_H
    const d = Math.sqrt(dx * dx + dy * dy)
    if (d <= 1.05) {
      const t = Math.max(0, 1 - d)
      DOTS.push({
        x,
        y,
        r: Number((0.65 + 1.85 * Math.pow(t, 1.2)).toFixed(2)),
        opacity: Number((0.06 + 0.76 * Math.pow(t, 1.3)).toFixed(2)),
      })
    }
  }
}

export function DotGrid({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      style={{ contain: "strict" }}
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,var(--foreground)_0%,transparent_70%)] opacity-[0.03] dark:opacity-[0.05]" />
      <svg
        viewBox="-370 -170 740 340"
        preserveAspectRatio="xMidYMid slice"
        shapeRendering="optimizeSpeed"
        className="size-full text-foreground/80 dark:text-foreground"
      >
        {DOTS.map((dot) => (
          <circle
            key={`${dot.x}_${dot.y}`}
            cx={dot.x}
            cy={dot.y}
            r={dot.r}
            fill="currentColor"
            opacity={dot.opacity}
          />
        ))}
      </svg>
    </div>
  )
}
