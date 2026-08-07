"use client"

import React from "react"

export function DoodleArrow({
  className = "",
  flip = false,
}: {
  className?: string
  flip?: boolean
}) {
  return (
    <svg
      viewBox="0 0 120 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`stroke-current ${flip ? "-scale-x-100" : ""} ${className}`}
      style={{ strokeLinecap: "round", strokeLinejoin: "round" }}
      aria-hidden="true"
    >
      <path d="M8 58C32 62 70 54 94 32C104 22 108 12 106 6" strokeWidth="2.5" />
      <path d="M86 4C96 3 108 5 112 8C110 14 104 26 98 32" strokeWidth="2.5" />
    </svg>
  )
}

export function DoodleCurlyArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`stroke-current ${className}`}
      style={{ strokeLinecap: "round", strokeLinejoin: "round" }}
      aria-hidden="true"
    >
      <path
        d="M12 20 C 35 5, 65 15, 60 42 C 55 65, 25 60, 22 45 C 20 35, 30 25, 48 30 C 58 33, 68 45, 72 65"
        strokeWidth="2.2"
      />
      <path d="M60 62 L 72 66 L 75 52" strokeWidth="2.2" />
    </svg>
  )
}

export function DoodleUnderline({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`stroke-current ${className}`}
      style={{ strokeLinecap: "round", strokeLinejoin: "round" }}
      aria-hidden="true"
    >
      <path d="M4 14C45 6 92 18 135 12C168 7 202 16 236 10" strokeWidth="3" />
      <path
        d="M18 19C65 14 112 21 158 17C188 14 214 18 228 16"
        strokeWidth="1.8"
        opacity="0.6"
      />
    </svg>
  )
}

export function DoodleCircle({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`stroke-current ${className}`}
      style={{ strokeLinecap: "round", strokeLinejoin: "round" }}
      aria-hidden="true"
    >
      <path
        d="M152 42C150 62 116 74 78 74C38 74 8 60 8 40C8 18 42 6 82 6C122 6 154 18 150 46C147 68 110 76 74 76"
        strokeWidth="2.2"
      />
    </svg>
  )
}

export function DoodleStar({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`fill-current stroke-current ${className}`}
      style={{ strokeLinecap: "round", strokeLinejoin: "round" }}
      aria-hidden="true"
    >
      <path
        d="M24 2L29 17L44 19L32 29L36 44L24 35L12 44L16 29L4 19L19 17L24 2Z"
        strokeWidth="2"
      />
    </svg>
  )
}

export function DoodleSparkle({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`stroke-current ${className}`}
      style={{ strokeLinecap: "round", strokeLinejoin: "round" }}
      aria-hidden="true"
    >
      <path d="M16 2V30M2 16H30" strokeWidth="2.2" />
      <path d="M7 7L25 25M25 7L7 25" strokeWidth="1.5" opacity="0.6" />
    </svg>
  )
}

export function DoodleAsterisk({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`stroke-current ${className}`}
      style={{ strokeLinecap: "round", strokeLinejoin: "round" }}
      aria-hidden="true"
    >
      <path d="M12 2V22M3.34 7L20.66 17M3.34 17L20.66 7" strokeWidth="2.2" />
    </svg>
  )
}

export function DoodleBurstBadge({
  text,
  className = "",
}: {
  text: string
  className?: string
}) {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-24 fill-background stroke-foreground text-foreground"
        aria-hidden="true"
      >
        <path
          d="M60 4L72 16L88 12L94 28L110 32L108 48L120 60L108 72L110 88L94 92L88 108L72 104L60 116L48 104L32 108L26 92L10 88L12 72L0 60L12 48L10 32L26 28L32 12L48 16L60 4Z"
          strokeWidth="2"
          className="fill-card stroke-foreground"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
        <span className="font-display text-[11px] leading-tight font-black tracking-tight text-foreground uppercase">
          {text}
        </span>
      </div>
    </div>
  )
}

export function DoodleTape({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none h-5 w-16 rotate-[-3deg] border-y border-foreground/20 bg-muted/80 select-none ${className}`}
      style={{
        clipPath:
          "polygon(0% 0%, 94% 0%, 100% 12%, 96% 28%, 100% 50%, 94% 75%, 100% 100%, 6% 100%, 0% 88%, 4% 65%, 0% 45%, 5% 20%)",
      }}
    />
  )
}
