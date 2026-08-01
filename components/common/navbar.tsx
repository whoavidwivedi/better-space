"use client"

import { site } from "@/lib/site"
import { RiArrowUpSLine } from "@remixicon/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ModeToggle } from "@/components/common/mode-toggle"
import { cn, isActive } from "@/lib/utils"

type NavLink = { href: string; label: string; external?: boolean }

const DEFAULT_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/lobby", label: "Lobby" },
]

const AVATAR_SEEDS = ["betterspace", "maya", "theo", "rina", "kai", "zoe", "sam"]

const AVATAR_SWAP_MS = 2000

const WAVEFORM_BARS = 4

function RotatingAvatar() {
  const reducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const [seedIndex, setSeedIndex] = useState(0)

  useEffect(() => {
    if (reducedMotion) return
    const interval = setInterval(() => {
      setSeedIndex((index) => (index + 1) % AVATAR_SEEDS.length)
    }, AVATAR_SWAP_MS)
    return () => clearInterval(interval)
  }, [reducedMotion])

  const seed = AVATAR_SEEDS[seedIndex % AVATAR_SEEDS.length]

  return (
    <Avatar className="border-border bg-muted size-8 border">
      <AvatarImage
        src={`https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=ffffff`}
        alt={site.name}
        className="object-contain"
      />
      <AvatarFallback>BS</AvatarFallback>
    </Avatar>
  )
}

function SpeakingWaveform() {
  const [levels, setLevels] = useState<number[]>(() =>
    Array.from({ length: WAVEFORM_BARS }, () => 30),
  )
  const driftRef = useRef(Array.from({ length: WAVEFORM_BARS }, () => Math.random() * 2 - 1))

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let animationFrameId = 0
    let lastTime = 0

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate)
      if (time - lastTime < 55) return
      lastTime = time

      setLevels((prev) =>
        prev.map((value, i) => {
          driftRef.current[i] = Math.min(
            1,
            Math.max(-1, driftRef.current[i] + (Math.random() - 0.5) * 0.9),
          )
          const drift = driftRef.current[i]
          const peak = 30 + Math.abs(drift) * 130
          const dip = 0.3 + Math.abs(drift) * 0.7
          const next = peak * (drift >= 0 ? 1 : dip)
          return next * 0.6 + value * 0.4
        }),
      )
    }

    animationFrameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  return (
    <span aria-hidden="true" className="flex h-4 items-center gap-0.5">
      {levels.map((level, i) => (
        <span
          key={i}
          className="bg-primary w-0.5 rounded-full transition-[height] duration-100 ease-out"
          style={{ height: `${level}%` }}
        />
      ))}
    </span>
  )
}

export function Navbar({ links = DEFAULT_LINKS }: { links?: NavLink[] }) {
  const pathname = usePathname()

  const activeLink = links.find(
    (link) => !link.external && isActive(pathname, link.href, { exact: false }),
  )

  const bottomNavRef = useRef<HTMLDivElement>(null)
  const [bottomNavWidth, setBottomNavWidth] = useState<number>(0)
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    const node = bottomNavRef.current
    if (!node) return

    const measure = () => {
      const rect = node.getBoundingClientRect()
      if (rect.width > 0) setBottomNavWidth(rect.width)
    }
    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(node)
    window.addEventListener("resize", measure)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [navOpen])

  return (
    <>
      <header
        className="border-border bg-background/80 sticky top-0 z-40 flex h-14 items-center border-b px-4 backdrop-blur-md md:px-6"
        style={{ viewTransitionName: "app-bar" }}
      >
        <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center">
          <Link href="/" className="flex min-w-0 items-center gap-2.5 justify-self-start">
            <RotatingAvatar />
            <span className="font-bold whitespace-nowrap">{site.name}</span>
            <SpeakingWaveform />
          </Link>

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-6 text-sm font-medium md:flex"
          >
            {links.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-muted-foreground hover:text-foreground transition-colors",
                    isActive(pathname, link.href, { exact: false }) && "text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>

          <div className="hidden justify-self-end md:block">
            <ModeToggle />
          </div>
        </div>
      </header>

      <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-40 -translate-x-1/2 md:hidden">
        <div
          ref={bottomNavRef}
          className="border-border bg-card/95 flex h-12 items-center rounded-lg border shadow-lg backdrop-blur-md"
        >
          <Popover open={navOpen} onOpenChange={setNavOpen}>
            <PopoverTrigger
              render={
                <button
                  type="button"
                  aria-label="Open navigation"
                  className="flex h-12 items-center pr-2 pl-3 text-sm font-semibold"
                >
                  <span className="bg-primary text-primary-foreground flex h-8 items-center gap-2 rounded-lg px-3">
                    <span
                      className="bg-primary-foreground/80 size-1.5 rounded-full"
                      aria-hidden="true"
                    />
                    {activeLink?.label ?? "Home"}
                  </span>
                  <span className="bg-border mx-2 h-5 w-px" aria-hidden="true" />
                  <span className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-8 items-center justify-center rounded-lg transition-colors">
                    <RiArrowUpSLine size={20} aria-hidden="true" />
                  </span>
                </button>
              }
            />
            <PopoverContent
              side="top"
              align="center"
              positionMethod="fixed"
              className="p-2"
              style={{
                width: bottomNavWidth > 0 ? bottomNavWidth : undefined,
                maxWidth: "calc(100vw - 2rem)",
              }}
            >
              <p className="text-muted-foreground px-3 pt-1.5 text-xs font-medium tracking-wide uppercase">
                Pages
              </p>
              <div className="flex flex-col">
                {links.map((link) =>
                  link.external ? (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-9 items-center rounded-md px-3 text-sm font-medium"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "text-muted-foreground flex h-9 items-center rounded-md px-3 text-sm font-medium hover:bg-muted hover:text-foreground",
                        isActive(pathname, link.href, { exact: false }) &&
                          "bg-muted text-foreground",
                      )}
                    >
                      {link.label}
                    </Link>
                  ),
                )}
              </div>
              <div className="border-border mt-2 flex items-center justify-between border-t px-3 pb-1 pt-2">
                <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Theme
                </span>
                <ModeToggle />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </>
  )
}
