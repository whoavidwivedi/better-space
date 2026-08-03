/* eslint-disable @next/next/no-img-element */
"use client"

import { site } from "@/lib/site"
import { RiArrowRightLine, RiArrowUpSLine } from "@remixicon/react"
import clsx from "clsx"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ModeToggle } from "@/components/common/mode-toggle"
import { isActive } from "@/lib/utils"

type NavLink = { href: string; label: string; external?: boolean }
type NavCta = { href: string; label: string }

const DEFAULT_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/lobby", label: "Lobby" },
]

function RotatingAvatar() {
  return (
    <Avatar
      className="size-8 shrink-0 border border-border bg-muted"
      aria-hidden="true"
    >
      <img
        src="https://api.dicebear.com/7.x/notionists/svg?seed=betterspace&backgroundColor=ffffff"
        alt=""
        className="size-full rounded-full object-cover"
      />
    </Avatar>
  )
}

function linkIsActive(pathname: string | null, href: string) {
  if (href.startsWith("#")) return false
  return isActive(pathname, href, { exact: false })
}

export function Navbar({
  links = DEFAULT_LINKS,
  cta,
}: {
  links?: NavLink[]
  cta?: NavCta
}) {
  const pathname = usePathname()

  const activeLink = links.find(
    (link) => !link.external && linkIsActive(pathname, link.href)
  )

  const [navOpen, setNavOpen] = useState(false)

  return (
    <>
      <header
        className="sticky top-0 z-40 flex h-14 items-center border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6"
        style={{ viewTransitionName: "app-bar" }}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2.5">
            <RotatingAvatar />
            <span className="font-bold tracking-tight whitespace-nowrap">
              {site.name}
            </span>
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
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              ) : link.href.startsWith("#") ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "transition-colors hover:text-foreground",
                    linkIsActive(pathname, link.href)
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <ModeToggle />
            {cta && (
              <Button
                render={<Link href={cta.href} />}
                size="sm"
                className="hidden h-8 gap-1 px-3 text-xs font-semibold transition-transform duration-150 ease-out active:scale-[0.97] sm:inline-flex"
              >
                {cta.label}
                <RiArrowRightLine className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Floating Bottom Navigation Pill for Mobile */}
      <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-40 -translate-x-1/2 md:hidden">
        <div className="flex h-11 items-center rounded-full border border-border bg-card/90 px-1 py-1 shadow-lg backdrop-blur-md">
          <Popover open={navOpen} onOpenChange={setNavOpen}>
            <PopoverTrigger
              render={
                <button
                  type="button"
                  aria-label="Open navigation"
                  className="flex h-9 items-center gap-2 pr-2 pl-3 text-xs font-semibold transition-colors focus-visible:outline-none"
                >
                  <span className="flex h-7 items-center gap-1.5 rounded-full bg-primary px-2.5 text-xs text-primary-foreground">
                    <span
                      className="size-1.5 motion-safe:animate-pulse rounded-full bg-primary-foreground/90"
                      aria-hidden="true"
                    />
                    {activeLink?.label ?? cta?.label ?? "Menu"}
                  </span>
                  <span className="h-4 w-px bg-border" aria-hidden="true" />
                  <span className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground">
                    <RiArrowUpSLine size={18} aria-hidden="true" />
                  </span>
                </button>
              }
            />
            <PopoverContent
              side="top"
              align="center"
              positionMethod="fixed"
              className="mb-2 w-56 max-w-[calc(100vw-2rem)] rounded-2xl border-border bg-card/95 p-2 shadow-xl backdrop-blur-md"
            >
              <p className="px-3 pt-1.5 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Navigation
              </p>
              <div className="flex flex-col gap-0.5">
                {links.map((link) =>
                  link.external ? (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setNavOpen(false)}
                      className="flex h-9 items-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  ) : link.href.startsWith("#") ? (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setNavOpen(false)}
                      className="flex h-9 items-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setNavOpen(false)}
                      className={clsx(
                        "flex h-9 items-center rounded-lg px-3 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                        linkIsActive(pathname, link.href)
                          ? "bg-muted font-semibold text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </div>
              {cta && (
                <div className="mt-2 border-t border-border px-1 pt-2">
                  <Button
                    render={<Link href={cta.href} />}
                    className="h-9 w-full gap-1.5 text-xs font-semibold"
                    onClick={() => setNavOpen(false)}
                  >
                    {cta.label}
                    <RiArrowRightLine className="size-3.5" />
                  </Button>
                </div>
              )}
              <div className="mt-2 flex items-center justify-between border-t border-border px-3 pt-2 pb-1">
                <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                  Appearance
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
