/* eslint-disable @next/next/no-img-element */
"use client"

export function Footer() {
  return (
    <footer className="relative w-full border-t border-border bg-card/60 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="relative size-8 rounded-full overflow-hidden border border-border bg-muted shrink-0">
              <img
                src="/Userpics/SVG/Circle/OSLO-1.svg"
                alt="Better Space Logo"
                className="size-full object-cover"
              />
            </div>
            <span className="font-display font-bold text-sm tracking-tight text-foreground">
              Better Space
            </span>
          </div>
          <p className="font-mono text-[11px] text-muted-foreground text-center sm:text-right">
            &copy; {new Date().getFullYear()} &middot; 100% Ephemeral Voice &middot; Zero Tracking
          </p>
        </div>
      </div>
    </footer>
  )
}
