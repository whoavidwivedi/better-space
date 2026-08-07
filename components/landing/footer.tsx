/* eslint-disable @next/next/no-img-element */
"use client"

import Link from "next/link"

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="relative w-full border-t border-border bg-card/60 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 focus:outline-none"
          >
            <div className="relative size-8 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
              <img
                src="/Userpics/SVG/Circle/OSLO-1.svg"
                alt="Better Space Logo"
                className="size-full object-cover"
              />
            </div>
            <span className="font-google-sans text-sm font-black tracking-tight text-foreground">
              better
              <span className="ml-0.5 font-serif-display font-normal text-muted-foreground italic">
                space
              </span>
            </span>
          </Link>
          <p className="text-center font-sans text-[11px] leading-relaxed text-muted-foreground sm:text-right">
            <span className="text-foreground">&copy; {year}</span>
            <span className="mx-1.5 text-foreground/40">·</span>
            <span>100% Ephemeral Voice</span>
            <span className="mx-1.5 text-foreground/40">·</span>
            <span>Zero Tracking</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
