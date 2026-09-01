"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { motion } from "framer-motion"

import { SiteLogo } from "@/components/common/site-logo"

const socials = [
  { label: "X", href: "https://x.com/whoavidwivedi" },
  { label: "GitHub", href: "https://github.com/whoavidwivedi" },
]

const productLinks = [
  { label: "Lobby", href: "/lobby" },
  { label: "Changelog", href: "/changelog" },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative flex min-h-[75vh] w-full flex-col items-center justify-center overflow-hidden bg-zinc-950 pt-24 pb-8 text-zinc-50 sm:min-h-[85vh] dark:bg-black">
      {/* Ambient background glows for premium feel */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute right-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[150px]" />

      {/* Center Monolith CTA */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col items-center"
        >
          <SiteLogo className="mb-10 size-12 text-zinc-50 opacity-90 sm:size-16" />

          <p className="mb-6 font-mono text-[10px] font-bold tracking-[0.25em] text-emerald-400/80 uppercase">
            Real voices, no clutter
          </p>

          <h2 className="font-display text-5xl leading-[0.95] font-black tracking-tight text-white sm:text-7xl md:text-[6rem]">
            Start <br />
            <span className="font-serif-display font-normal text-zinc-400 italic">
              broadcasting.
            </span>
          </h2>

          <motion.div
            className="mt-14"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <Link
              href="/"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white px-10 font-mono text-xs font-bold tracking-[0.2em] text-zinc-950 uppercase shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-colors hover:bg-zinc-200"
            >
              Launch a Space
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Anchored Corners Navigation */}
      <div className="absolute inset-x-0 bottom-0 z-10 mx-auto w-full max-w-7xl px-6 pb-8 sm:px-12 sm:pb-12">
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row sm:items-end">
          {/* Bottom Left: Brand & Copyright */}
          <div className="flex flex-col items-center gap-1.5 sm:items-start">
            <span className="font-google-sans text-base font-black tracking-tight text-white">
              better
              <span className="ml-0.5 font-serif-display font-normal text-zinc-400 italic">
                space
              </span>
            </span>
            <span className="font-mono text-[9px] font-bold tracking-[0.1em] text-zinc-500 uppercase">
              &copy; {year} • Built by whoavidwivedi
            </span>
          </div>

          {/* Bottom Right: Essential Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:justify-end">
            <nav aria-label="Product" className="flex items-center gap-6">
              {productLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div
              className="hidden h-3 w-px bg-zinc-800 sm:block"
              aria-hidden="true"
            />
            <nav aria-label="Socials" className="flex items-center gap-6">
              {socials.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-1 font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase transition-colors hover:text-white"
                >
                  {link.label}
                  <ArrowUpRight
                    size={10}
                    className="opacity-40 transition-opacity group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}
