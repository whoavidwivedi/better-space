"use client"

import { site } from "@/lib/site"
import {
  RiArrowRightLine,
  RiEmotionHappyLine,
  RiGithubLine,
  RiGlobalLine,
  RiGroupLine,
  RiHeadphoneLine,
  RiInstagramLine,
  RiKeyboardBoxLine,
  RiLinkedinLine,
  RiLinksLine,
  RiMic2Line,
  RiMicOffLine,
  RiMicLine,
  RiShieldCheckLine,
  RiTwitterXLine,
  RiUserAddLine,
  RiUserUnfollowLine,
  RiVoiceprintLine,
  RiVolumeMuteLine,
  RiVolumeUpLine,
} from "@remixicon/react"
import Link from "next/link"
import { useEffect, useRef, useState, type ReactNode } from "react"

import { Navbar } from "@/components/common/navbar"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Kbd, KbdGroup } from "@/components/ui/kbd"

const SPEAKERS = [
  { name: "Maya", muted: false, host: true, listener: false },
  { name: "Theo", muted: false, listener: false },
  { name: "Rina", muted: true, listener: false },
  { name: "Sam", muted: false, listener: false },
  { name: "Zoe", muted: true, listener: true },
  { name: "Kai", muted: false, listener: true },
]

const HIGHLIGHTS = [
  {
    title: "Zero accounts",
    description: "Pick a name and jump in. No signup, no friction.",
    icon: RiUserAddLine,
  },
  {
    title: "Runs in your browser",
    description: "No install. Any device, any platform, one link.",
    icon: RiGlobalLine,
  },
]

const FEATURES = [
  {
    title: "High-fidelity audio",
    description:
      "Crystal-clear voice with echo cancellation, noise suppression, and studio-grade processing baked in.",
    icon: RiVoiceprintLine,
    wide: true,
    mock: "audio" as const,
  },
  {
    title: "Zero accounts",
    description: "Pick a name and jump in. No signup, no password, no friction.",
    icon: RiUserAddLine,
    wide: false,
    mock: null,
  },
  {
    title: "Live reactions",
    description: "React with emoji without interrupting the conversation.",
    icon: RiEmotionHappyLine,
    wide: false,
    mock: null,
  },
  {
    title: "Host controls",
    description:
      "Grant and revoke the mic, mute, or remove someone with a tap. Your room, your rules.",
    icon: RiShieldCheckLine,
    wide: true,
    mock: "host" as const,
  },
  {
    title: "Invite links",
    description: "Copy one link to share the space. Anyone can drop in.",
    icon: RiLinksLine,
    wide: false,
    mock: null,
  },
  {
    title: "Keyboard shortcuts",
    description: "Mute, deafen, and switch themes without leaving the keyboard.",
    icon: RiKeyboardBoxLine,
    wide: true,
    mock: "shortcuts" as const,
  },
]

const STEPS = [
  {
    title: "Pick a name",
    description: "No account needed. Type your name and you are ready to go.",
    icon: RiUserAddLine,
  },
  {
    title: "Start or join a space",
    description: "Browse active spaces, or start your own and invite friends.",
    icon: RiGroupLine,
  },
  {
    title: "Talk",
    description: "Speak when you have the mic. Listen, react, and hand it off.",
    icon: RiMic2Line,
  },
]


const FAQS = [
  {
    question: "Do I need an account?",
    answer:
      "No. Better Space is deliberately zero-account. Pick any name, and you can start or join a space in a few seconds. Nothing to install and nothing to remember.",
  },
  {
    question: "What do I need to join a space?",
    answer:
      "Just a modern browser and a microphone. Audio is delivered over a secure WebRTC connection, with echo cancellation and noise suppression applied automatically.",
  },
  {
    question: "Who can start a space?",
    answer:
      "Anyone. Open the lobby, give your space a name, and you are the host. You control who gets the mic, who gets muted, and when the space ends.",
  },
  {
    question: "How do host controls work?",
    answer:
      "The host can grant or revoke the microphone, mute a speaker, or remove someone from the space. Speakers who join without the mic start as listeners and can request it with one tap.",
  },
  {
    question: "What does it cost?",
    answer: "Nothing while Better Space is in beta.",
  },
]

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="border-border bg-muted text-muted-foreground inline-flex h-8 items-center gap-2 rounded-full border px-4 text-sm font-medium">
      {children}
    </span>
  )
}

function SectionHeading({ eyebrow, id, title }: { eyebrow: string; id: string; title: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 id={id} className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>
    </div>
  )
}

function SpeakerAvatar({ speaker }: { speaker: (typeof SPEAKERS)[number] }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <div
          className={`rounded-full transition-shadow ${
            speaker.host ? "ring-primary ring-offset-background ring-2 ring-offset-2" : ""
          }`}
        >
          <Avatar className="border-border bg-muted size-14 border">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${speaker.name.toLowerCase()}&backgroundColor=ffffff`}
              alt=""
              className="object-contain"
            />
            <AvatarFallback>{speaker.name[0]}</AvatarFallback>
          </Avatar>
        </div>
        {!speaker.listener && (
          <span className="bg-background border-border absolute -right-1 -bottom-1 rounded-full border p-0.5">
            {speaker.muted ? (
              <RiMicOffLine className="text-muted-foreground size-3.5" aria-hidden="true" />
            ) : (
              <RiMic2Line className="text-primary size-3.5" aria-hidden="true" />
            )}
          </span>
        )}
      </div>
      <span className="flex items-center gap-1 text-xs font-medium">
        {speaker.name}
      </span>
      <span className="text-muted-foreground -mt-1 flex items-center gap-0.5 text-[10px]">
        {speaker.listener ? (
          <>
            <RiHeadphoneLine className="size-3" aria-hidden="true" />
            Listener
          </>
        ) : (
          "Speaker"
        )}
      </span>
    </div>
  )
}

function HeroVisual() {
  return (
    <div className="mt-16 w-full max-w-lg">
      <div className="bg-card border-border rounded-2xl border p-5 text-left shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">design-critique</span>
          </div>
          <span className="text-muted-foreground text-xs">{SPEAKERS.length} speakers</span>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-4">
          {SPEAKERS.map((speaker) => (
            <SpeakerAvatar key={speaker.name} speaker={speaker} />
          ))}
        </div>

        <div className="border-border mt-5 flex items-center gap-2 border-t pt-4">
          <span className="bg-muted text-muted-foreground flex h-9 min-w-0 flex-1 items-center gap-1.5 rounded-lg px-3 text-xs font-medium">
            <RiLinksLine className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">better.space/design-critique</span>
          </span>
          <span className="bg-primary text-primary-foreground flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium">
            <RiVolumeUpLine className="size-4" aria-hidden="true" />
            Deafen
          </span>
          <span className="bg-muted text-muted-foreground flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium">
            <RiEmotionHappyLine className="size-4" aria-hidden="true" />
            React
          </span>
        </div>
      </div>
    </div>
  )
}

function AnimatedWaveform({ bars = 7 }: { bars?: number }) {
  const [levels, setLevels] = useState<number[]>(() => Array.from({ length: bars }, () => 14))
  const driftRef = useRef(Array.from({ length: bars }, () => Math.random() * 2 - 1))

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
          const peak = 8 + Math.abs(drift) * 30
          const dip = 0.3 + Math.abs(drift) * 0.7
          const next = peak * (drift >= 0 ? 1 : dip)
          return next * 0.6 + value * 0.4
        }),
      )
    }

    animationFrameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrameId)
  }, [bars])

  return (
    <span aria-hidden="true" className="flex h-6 items-center gap-1">
      {levels.map((level, i) => (
        <span
          key={i}
          className="bg-primary w-1 rounded-full transition-[height] duration-100 ease-out"
          style={{ height: `${level}px` }}
        />
      ))}
    </span>
  )
}

function FeatureMock({ mock }: { mock: "audio" | "host" | "shortcuts" | null }) {
  if (mock === "audio") {
    return (
      <div className="bg-background border-border mt-6 flex items-center justify-between gap-4 rounded-lg border p-3">
        <div className="flex -space-x-2">
          {["maya", "theo", "sam"].map((seed) => (
            <Avatar key={seed} className="border-border bg-muted size-9 border">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=ffffff`}
                alt=""
                className="object-contain"
              />
              <AvatarFallback>{seed[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          ))}
        </div>
        <AnimatedWaveform />
      </div>
    )
  }

  if (mock === "host") {
    return (
      <div className="mt-6 flex flex-wrap gap-2">
        <span className="text-success border-success/20 bg-success/10 flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium">
          <RiMicLine className="size-3.5" aria-hidden="true" />
          Grant Mic
        </span>
        <span className="border-border bg-muted text-muted-foreground flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium">
          <RiVolumeMuteLine className="size-3.5" aria-hidden="true" />
          Mute
        </span>
        <span className="text-destructive border-destructive/20 bg-destructive/10 flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium">
          <RiUserUnfollowLine className="size-3.5" aria-hidden="true" />
          Kick
        </span>
      </div>
    )
  }

  if (mock === "shortcuts") {
    return (
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
        <span className="text-muted-foreground flex items-center gap-2">
          Mute
          <KbdGroup>
            <Kbd>&#8984;</Kbd>
            <Kbd>D</Kbd>
          </KbdGroup>
        </span>
        <span className="text-muted-foreground flex items-center gap-2">
          Deafen
          <KbdGroup>
            <Kbd>&#8984;</Kbd>
            <Kbd>E</Kbd>
          </KbdGroup>
        </span>
      </div>
    )
  }

  return null
}

export default function LandingPage() {
  return (
      <div className="flex min-h-svh flex-col">
      <Navbar />

      <main className="flex-1">
        <section
          aria-labelledby="hero-heading"
          className="relative isolate min-h-svh overflow-hidden px-4 pt-24 pb-20 md:px-6"
        >
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
            <Eyebrow>Live audio rooms</Eyebrow>

            <h1 id="hero-heading" className="mt-6 text-5xl font-bold tracking-tight text-balance sm:text-7xl">
              {site.name}
            </h1>

            <p className="text-muted-foreground mt-6 max-w-xl text-lg">
              {site.description}
            </p>

            <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
              <Button
                render={<Link href="/lobby" />}
                className="h-10 w-full max-w-sm px-5 text-sm sm:w-auto"
              >
                Enter Lobby
                <RiArrowRightLine />
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-muted-foreground text-xs">
              {["Zero accounts", "Real-time voice", "No install"].map((item, index) => (
                <span key={item} className="flex items-center gap-1.5">
                  {index > 0 && <span className="text-border" aria-hidden="true">/</span>}
                  {item}
                </span>
              ))}
            </div>

            <HeroVisual />
          </div>
        </section>

        <section
          aria-label="Why Better Space"
          className="border-border border-t border-dashed px-4 py-16 md:px-6"
        >
          <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
            {HIGHLIGHTS.map((highlight) => (
              <div key={highlight.title} className="flex flex-col items-center gap-2 text-center">
                <highlight.icon className="text-primary size-6" aria-hidden="true" />
                <h3 className="font-semibold">{highlight.title}</h3>
                <p className="text-muted-foreground max-w-52 text-sm">{highlight.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="features-heading" id="features" className="px-4 py-24 md:px-6">
          <div className="mx-auto w-full max-w-4xl">
            <SectionHeading
              eyebrow="Features"
              id="features-heading"
              title="Everything you need to talk"
            />

            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className={`bg-card border-border rounded-xl border p-5 ${feature.wide ? "lg:col-span-2" : ""}`}
                >
                  <div className="bg-muted flex size-10 items-center justify-center rounded-lg">
                    <feature.icon className="text-primary size-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">{feature.description}</p>
                  <FeatureMock mock={feature.mock} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="how-heading"
          id="how-it-works"
          className="border-border bg-muted/50 border-t px-4 py-24 md:px-6"
        >
          <div className="mx-auto w-full max-w-4xl">
            <SectionHeading
              eyebrow="How it works"
              id="how-heading"
              title="In the room in under a minute"
            />

            <ol className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {STEPS.map((step, index) => (
                <li key={step.title} className="bg-card border-border rounded-xl border p-5">
                  <span className="text-muted-foreground font-mono text-xs font-medium">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="bg-muted mt-3 flex size-8 items-center justify-center rounded-lg">
                    <step.icon className="text-muted-foreground size-4" aria-hidden="true" />
                  </div>
                  <h3 className="mt-3 font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>


        <section
          aria-labelledby="faq-heading"
          id="faq"
          className="border-border bg-muted/50 border-t px-4 py-24 md:px-6"
        >
          <div className="mx-auto w-full max-w-2xl">
            <SectionHeading eyebrow="FAQ" id="faq-heading" title="Questions, answered" />

            <Accordion className="mt-10">
              {FAQS.map((faq) => (
                <AccordionItem key={faq.question} value={faq.question}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section aria-labelledby="cta-heading" className="px-4 py-24 md:px-6">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
            <Eyebrow>Ready when you are</Eyebrow>
            <h2 id="cta-heading" className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Hear the difference
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl text-lg">
              Jump into a live space right now. No account required.
            </p>
            <Button render={<Link href="/lobby" />} className="mt-8 h-12 px-6 text-base">
              Enter Lobby
              <RiArrowRightLine />
            </Button>
          </div>
        </section>
      </main>

      <footer className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-24 z-0">
          <div className="bg-primary/10 absolute left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full blur-3xl" />
        </div>

        <div className="border-border relative z-10 border-t px-4 pb-12 md:px-6">
          <div className="mx-auto w-full max-w-4xl">
            <div className="border-border flex flex-col items-start justify-between gap-10 py-14 md:flex-row md:items-center">
              <div className="max-w-sm">
                <p className="text-3xl font-bold tracking-tight md:text-4xl">
                  Hear the difference.
                </p>
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                  {site.name} is {site.tagline.toLowerCase()}. Built to feel like you are in the
                  room — not on a call.
                </p>
                <Button
                  render={<Link href="/lobby" />}
                  className="mt-6 h-9 px-4 text-sm"
                >
                  Enter Lobby
                  <RiArrowRightLine />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-10">
                <nav aria-label="Product" className="flex flex-col gap-2.5 text-sm">
                  <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    Product
                  </p>
                  <Link
                    href="/lobby"
                    className="hover:text-foreground text-muted-foreground transition-colors"
                  >
                    Lobby
                  </Link>
                  <Link
                    href="#features"
                    className="hover:text-foreground text-muted-foreground transition-colors"
                  >
                    Features
                  </Link>
                  <Link
                    href="#how-it-works"
                    className="hover:text-foreground text-muted-foreground transition-colors"
                  >
                    How it works
                  </Link>
                  <Link
                    href="#faq"
                    className="hover:text-foreground text-muted-foreground transition-colors"
                  >
                    FAQ
                  </Link>
                </nav>

                <nav aria-label="Creator" className="flex flex-col gap-2.5 text-sm">
                  <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    Creator
                  </p>
                  <a
                    href={site.creator.website}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-foreground text-muted-foreground inline-flex items-center gap-1.5 transition-colors"
                  >
                    <RiGlobalLine className="size-4" aria-hidden="true" />
                    {site.creator.handle}
                  </a>
                  <a
                    href={site.creator.social.github}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-foreground text-muted-foreground inline-flex items-center gap-1.5 transition-colors"
                  >
                    <RiGithubLine className="size-4" aria-hidden="true" />
                    GitHub
                  </a>
                  <a
                    href={site.creator.social.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-foreground text-muted-foreground inline-flex items-center gap-1.5 transition-colors"
                  >
                    <RiInstagramLine className="size-4" aria-hidden="true" />
                    Instagram
                  </a>
                  <a
                    href={site.creator.social.x}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-foreground text-muted-foreground inline-flex items-center gap-1.5 transition-colors"
                  >
                    <RiTwitterXLine className="size-4" aria-hidden="true" />
                    X (Twitter)
                  </a>
                  <a
                    href={site.creator.social.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-foreground text-muted-foreground inline-flex items-center gap-1.5 transition-colors"
                  >
                    <RiLinkedinLine className="size-4" aria-hidden="true" />
                    LinkedIn
                  </a>
                </nav>
              </div>
            </div>

            <div className="border-border mx-auto flex w-full flex-col items-center justify-between gap-3 border-t pt-6 md:flex-row">
              <p className="text-muted-foreground text-xs">
                &copy; {new Date().getFullYear()} {site.name} by{" "}
                <a
                  href={site.creator.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-foreground underline-offset-2 transition-colors hover:underline"
                >
                  {site.creator.handle}
                </a>
                .
              </p>
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                {["Zero accounts", "Real-time voice", "Built in the browser"].map(
                  (item, index) => (
                    <span key={item} className="flex items-center gap-1.5">
                      {index > 0 && <span className="text-border" aria-hidden="true">/</span>}
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </footer>
      </div>
  )
}
