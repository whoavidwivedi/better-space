import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"

import { SiteLogo } from "@/components/common/site-logo"
import { Button } from "@/components/ui/button"
import { STARTER_TEMPLATES } from "@/lib/presets"
import { site } from "@/lib/site"

const columns = [
  {
    title: "Product",
    links: [
      { label: "Lobby", href: "/lobby" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Rooms",
    links: STARTER_TEMPLATES.map((t) => ({
      label: t.topic,
      href: `/space/${t.name}`,
    })),
  },
  {
    title: "Connect",
    links: [
      { label: "GitHub", href: site.creator.social.github, external: true },
      { label: "X", href: site.creator.social.x, external: true },
      { label: "LinkedIn", href: site.creator.social.linkedin, external: true },
    ],
  },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="w-full bg-background px-4 pt-16 pb-6 sm:px-6 sm:pt-24">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-border bg-card">
        <div className="grid gap-12 p-6 sm:p-10 md:grid-cols-[1.2fr_1fr] md:gap-16 lg:p-12">
          {/* Brand and the two actions */}
          <div>
            <Link href="/" className="flex w-fit items-center gap-2.5">
              <SiteLogo className="size-8" />
              <span className="font-display text-xl text-foreground">
                better
                <span className="ml-0.5 font-serif-display text-muted-foreground">
                  space
                </span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm font-display text-2xl leading-snug text-foreground sm:text-3xl">
              Pull up a chair. Rooms open in one click.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                size="lg"
                render={<Link href="/lobby" />}
                nativeButton={false}
              >
                Start a room
                <ArrowRight data-icon="inline-end" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                render={<Link href="/lobby" />}
                nativeButton={false}
              >
                Browse rooms
              </Button>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h3 className="text-sm font-semibold text-foreground">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {"external" in link && link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Credit line */}
        <div className="flex flex-col gap-2 border-t border-border px-6 py-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-12">
          <span>
            &copy; {year} {site.name}
          </span>
          <span>
            Designed &amp; built by{" "}
            <a
              href={site.creator.website}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-0.5 font-medium text-foreground underline decoration-foreground/25 underline-offset-4 transition-colors hover:decoration-foreground"
            >
              {site.creator.name}
              <ArrowUpRight
                size={14}
                aria-hidden="true"
                className="transition-transform duration-(--duration-quick) ease-(--ease-out) group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}
