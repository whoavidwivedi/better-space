export function BetterSpaceMark({
  className,
  strokeWidth = 4,
  animated = false,
}: {
  className?: string
  strokeWidth?: number
  animated?: boolean
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={className}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    >
      {/* central voice dot */}
      <circle cx="20" cy="20" r="3" fill="currentColor" stroke="none" />
      {/* spatial audio rings */}
      <circle
        cx="20"
        cy="20"
        r="9"
        className={
          animated ? "animate-[mark-wave_3s_ease-out_infinite]" : undefined
        }
      />
      <circle
        cx="20"
        cy="20"
        r="15"
        className={
          animated ? "animate-[mark-wave_3s_ease-out_0.8s_infinite]" : undefined
        }
      />
    </svg>
  )
}
