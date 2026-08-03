/* eslint-disable @next/next/no-img-element */
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
  RiShieldStarLine,
  RiTimerLine,
  RiTwitterXLine,
  RiUserAddLine,
  RiUserSmileLine,
  RiUserStarLine,
  RiUserUnfollowLine,
  RiVoiceprintLine,
  RiVolumeMuteLine,
  RiVolumeUpLine,
} from "@remixicon/react"
import Link from "next/link"
import { type ReactNode } from "react"

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
  {
    name: "Maya",
    role: "Host",
    muted: false,
    host: true,
    cohost: false,
    listener: false,
    seed: "felix",
  },
  {
    name: "Theo",
    role: "Co-host",
    muted: false,
    host: false,
    cohost: true,
    listener: false,
    seed: "oliver",
  },
  {
    name: "Rina",
    role: "Speaker",
    muted: true,
    host: false,
    cohost: false,
    listener: false,
    seed: "anita",
  },
  {
    name: "Sam",
    role: "Speaker",
    muted: false,
    host: false,
    cohost: false,
    listener: false,
    seed: "elena",
  },
  {
    name: "Zoe",
    role: "Listener",
    muted: true,
    host: false,
    cohost: false,
    listener: true,
    seed: "jasper",
  },
  {
    name: "Kai",
    role: "Listener",
    muted: true,
    host: false,
    cohost: false,
    listener: true,
    seed: "luna",
  },
]

const HIGHLIGHTS = [
  {
    title: "Co-host Delegation",
    description:
      "Promote trusted participants to co-hosts to moderate, mute, and manage speaking requests collaboratively.",
    icon: RiUserStarLine,
  },
  {
    title: "60s Rejoin Grace Timer",
    description:
      "Accidentally closed your tab? A 60-second grace timer preserves your space and lets you reclaim host powers.",
    icon: RiTimerLine,
  },
  {
    title: "118+ Character Avatars",
    description:
      "Choose permanent Notionist character identities or generate custom seeds. No blurry accounts required.",
    icon: RiUserSmileLine,
  },
]

const FEATURES = [
  {
    title: "Co-host & Host Moderation",
    description:
      "Share moderation superpowers. Co-hosts can approve mic requests from listeners, mute noisy participants, and remove bad actors.",
    icon: RiShieldStarLine,
    wide: true,
    mock: "cohost" as const,
  },
  {
    title: "Host Rejoin Grace Period",
    description:
      "If the host drops off or refreshes, the space stays alive with a 60s countdown so the host can jump right back in.",
    icon: RiTimerLine,
    wide: false,
    mock: "timer" as const,
  },
  {
    title: "118+ Character Identities",
    description:
      "Explore a gallery of curated Notionist character avatars with real-time search, random shuffle, and custom seed generation.",
    icon: RiUserSmileLine,
    wide: false,
    mock: "avatars" as const,
  },
  {
    title: "High-fidelity Opus Audio",
    description:
      "Studio-grade audio with hardware echo cancellation, noise suppression, and automatic background recovery when switching apps.",
    icon: RiVoiceprintLine,
    wide: true,
    mock: "audio" as const,
  },
  {
    title: "Stage Requests & Hand Raising",
    description:
      "Listeners can tap to request the mic. Hosts and co-hosts can grant stage access with a single click.",
    icon: RiMic2Line,
    wide: false,
    mock: null,
  },
  {
    title: "Instant One-Link Sharing",
    description:
      "Each space gets its own clean link (e.g. better.space/space/design-critique-7x9q). Share anywhere.",
    icon: RiLinksLine,
    wide: false,
    mock: null,
  },
  {
    title: "Live Reactions & Shortcuts",
    description:
      "Float emoji reactions across the room and control your mic with effortless keyboard shortcuts.",
    icon: RiKeyboardBoxLine,
    wide: true,
    mock: "shortcuts" as const,
  },
]

const STEPS = [
  {
    title: "Pick your character & name",
    description:
      "Choose an avatar from 118+ handpicked presets and enter your display name. No signup needed.",
    icon: RiUserSmileLine,
  },
  {
    title: "Start or join a live space",
    description:
      "Create your own room in one tap or join an ongoing discussion with instant WebRTC connection.",
    icon: RiGroupLine,
  },
  {
    title: "Appoint co-hosts & talk",
    description:
      "Delegate co-host powers, grant stage mics, pass the conversation, and react live.",
    icon: RiMic2Line,
  },
]

const FAQS = [
  {
    question: "How does co-hosting work?",
    answer:
      "The space creator is the primary Host and can promote any speaker to Co-host. Co-hosts have full stage moderation rights: they can approve mic requests from listeners, mute speakers, and remove disruptive participants, keeping large discussions smooth.",
  },
  {
    question: "What happens if the host disconnects or leaves?",
    answer:
      "If the host drops due to a network glitch or page reload, Better Space triggers a 60-second grace period timer. The lobby displays a countdown banner allowing the host to rejoin and automatically reclaim full host privileges. If the host explicitly ends the space, the room closes gracefully for everyone.",
  },
  {
    question: "How do character avatars and names work?",
    answer:
      "Better Space features over 118 handpicked Notionist avatars plus custom seed generators. Once you select your character and enter a space, your identity is permanent for that space session so attendees can easily recognize who is speaking.",
  },
  {
    question: "Do I need to create an account or install software?",
    answer:
      "No. Better Space is 100% zero-account and runs directly inside any modern browser on desktop, iPad, tablet, and mobile. Just open the link, pick a name, and join.",
  },
  {
    question: "How does the audio work when I switch apps?",
    answer:
      "Audio is powered by high-fidelity LiveKit WebRTC with Opus codecs. If you briefly open another media app or tab, our automatic audio recovery re-engages your microphone and audio stream the moment you switch back.",
  },
  {
    question: "What does Better Space cost?",
    answer: "Nothing. Better Space is free and open to everyone during beta.",
  },
]

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-8 items-center gap-2 rounded-full border border-border bg-muted px-4 text-sm font-medium text-muted-foreground">
      {children}
    </span>
  )
}

function SectionHeading({
  eyebrow,
  id,
  title,
}: {
  eyebrow: string
  id: string
  title: string
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2
        id={id}
        className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl"
      >
        {title}
      </h2>
    </div>
  )
}

function SpeakerAvatar({ speaker }: { speaker: (typeof SPEAKERS)[number] }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative">
        <div
          className={`rounded-full transition-shadow ${
            speaker.host
              ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
              : speaker.cohost
                ? "ring-2 ring-primary/60 ring-offset-2 ring-offset-background"
                : ""
          }`}
        >
          <Avatar className="size-14 border border-border bg-muted">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${speaker.seed}&backgroundColor=ffffff`}
              alt={speaker.name}
              className="object-contain"
            />
            <AvatarFallback>{speaker.name[0]}</AvatarFallback>
          </Avatar>
        </div>
        {!speaker.listener && (
          <span className="absolute -right-1 -bottom-1 rounded-full border border-border bg-background p-0.5 shadow-xs">
            {speaker.muted ? (
              <RiMicOffLine
                className="size-3.5 text-muted-foreground"
                aria-hidden="true"
              />
            ) : (
              <RiMic2Line
                className="size-3.5 text-primary"
                aria-hidden="true"
              />
            )}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs font-semibold text-foreground">
          {speaker.name}
        </span>
      </div>
      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
        {speaker.host ? (
          <span className="py-0.2 inline-flex items-center gap-0.5 rounded border-primary/20 bg-primary/10 px-1 font-medium text-primary">
            <RiShieldCheckLine className="size-2.5" /> Host
          </span>
        ) : speaker.cohost ? (
          <span className="py-0.2 inline-flex items-center gap-0.5 rounded border-primary/20 bg-primary/10 px-1 font-medium text-primary">
            <RiShieldStarLine className="size-2.5" /> Co-host
          </span>
        ) : speaker.listener ? (
          <span className="inline-flex items-center gap-0.5">
            <RiHeadphoneLine className="size-3" aria-hidden="true" /> Listener
          </span>
        ) : (
          "Speaker"
        )}
      </span>
    </div>
  )
}

function HeroVisual() {
  return (
    <div className="mt-12 w-full max-w-lg">
      <div className="rounded-2xl border border-border bg-card p-5 text-left shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-2 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-sm font-semibold text-foreground">
              design-critique-7x9q
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              <RiGroupLine className="size-3.5" /> 6 in space
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-4">
          {SPEAKERS.map((speaker) => (
            <SpeakerAvatar key={speaker.name} speaker={speaker} />
          ))}
        </div>

        <div className="mt-5 flex items-center gap-2 border-t border-border pt-4">
          <span className="flex h-9 min-w-0 flex-1 items-center gap-1.5 rounded-lg bg-muted px-3 text-xs font-medium text-muted-foreground">
            <RiLinksLine className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">better.space/space/design-critique</span>
          </span>
          <span className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground">
            <RiVolumeUpLine className="size-4" aria-hidden="true" />
            Deafen
          </span>
          <span className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-muted px-3 text-xs font-medium text-muted-foreground hover:text-foreground">
            <RiEmotionHappyLine className="size-4" aria-hidden="true" />
            React
          </span>
        </div>
      </div>
    </div>
  )
}

function FeatureMock({
  mock,
}: {
  mock: "audio" | "cohost" | "timer" | "avatars" | "shortcuts" | null
}) {
  if (mock === "audio") {
    return (
      <div className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-border bg-background p-3">
        <div className="flex -space-x-2">
          {["felix", "oliver", "anita", "elena"].map((seed) => (
            <Avatar key={seed} className="size-8 border border-border bg-muted">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=ffffff`}
                alt=""
                className="object-contain"
              />
              <AvatarFallback>{seed[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
          Auto Audio Recovery Active
        </div>
      </div>
    )
  }

  if (mock === "cohost") {
    return (
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-muted px-2.5 text-xs font-medium text-foreground">
          <RiShieldStarLine className="size-3.5" aria-hidden="true" />
          Make Co-host
        </span>
        <span className="flex h-8 items-center gap-1.5 rounded-lg border border-success/20 bg-success/10 px-2.5 text-xs font-medium text-success">
          <RiMicLine className="size-3.5" aria-hidden="true" />
          Grant Mic
        </span>
        <span className="flex h-8 items-center gap-1.5 rounded-lg border border-border bg-muted px-2.5 text-xs font-medium text-muted-foreground">
          <RiVolumeMuteLine className="size-3.5" aria-hidden="true" />
          Mute Speaker
        </span>
        <span className="flex h-8 items-center gap-1.5 rounded-lg border border-destructive/20 bg-destructive/10 px-2.5 text-xs font-medium text-destructive">
          <RiUserUnfollowLine className="size-3.5" aria-hidden="true" />
          Remove
        </span>
      </div>
    )
  }

  if (mock === "timer") {
    return (
      <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-background p-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <RiTimerLine className="size-4 text-primary" />
          <span>Host Grace Timer</span>
        </div>
        <span className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-xs font-medium text-muted-foreground">
          52s remaining
        </span>
      </div>
    )
  }

  if (mock === "avatars") {
    return (
      <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-background p-2.5">
        <div className="flex -space-x-1.5 overflow-hidden">
          {["leo", "mia", "noah", "ruby", "sam"].map((seed) => (
            <div
              key={seed}
              className="size-7 overflow-hidden rounded-full border border-background bg-muted"
            >
              <img
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=ffffff`}
                alt=""
                className="size-full object-cover"
              />
            </div>
          ))}
        </div>
        <span className="text-[11px] font-medium text-muted-foreground">
          118+ Characters + Custom
        </span>
      </div>
    )
  }

  if (mock === "shortcuts") {
    return (
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs">
        <span className="flex items-center gap-2 text-muted-foreground">
          Toggle Mute
          <KbdGroup>
            <Kbd>&#8984;</Kbd>
            <Kbd>D</Kbd>
          </KbdGroup>
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          Toggle Deafen
          <KbdGroup>
            <Kbd>&#8984;</Kbd>
            <Kbd>E</Kbd>
          </KbdGroup>
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          Request Mic
          <KbdGroup>
            <Kbd>&#8984;</Kbd>
            <Kbd>M</Kbd>
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
      <Navbar
        links={[
          { href: "/", label: "Home" },
          { href: "#features", label: "Features" },
          { href: "#how-it-works", label: "How it works" },
          { href: "#faq", label: "FAQ" },
          { href: "/lobby", label: "Lobby" },
        ]}
        cta={{ href: "/lobby", label: "Enter Lobby" }}
      />

      <main className="flex-1">
        <section
          aria-labelledby="hero-heading"
          className="relative isolate min-h-[calc(100svh-3.5rem)] overflow-hidden px-4 pt-14 pb-20 md:px-6 md:pt-20"
        >
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
            <Eyebrow>Live audio rooms with co-hosting & timers</Eyebrow>

            <h1
              id="hero-heading"
              className="mt-6 text-5xl font-bold tracking-tight text-balance sm:text-7xl"
            >
              {site.name}
            </h1>

            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              {site.description}
            </p>

            <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
              <Button
                render={<Link href="/lobby" />}
                className="h-11 w-full max-w-sm px-6 text-sm shadow-md sm:w-auto"
              >
                Enter Lobby
                <RiArrowRightLine />
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
              {[
                "Co-host delegation",
                "60s Rejoin Grace Timer",
                "118+ Character Identities",
                "Zero accounts",
              ].map((item, index) => (
                <span key={item} className="flex items-center gap-1.5">
                  {index > 0 && (
                    <span className="text-border" aria-hidden="true">
                      /
                    </span>
                  )}
                  {item}
                </span>
              ))}
            </div>

            <HeroVisual />
          </div>
        </section>

        <section
          aria-label="Why Better Space"
          className="border-t border-dashed border-border px-4 py-16 md:px-6"
        >
          <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
            {HIGHLIGHTS.map((highlight) => (
              <div
                key={highlight.title}
                className="flex flex-col items-center gap-2.5 text-center"
              >
                <div className="flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-xs">
                  <highlight.icon className="size-5" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  {highlight.title}
                </h3>
                <p className="max-w-56 text-xs leading-relaxed text-muted-foreground">
                  {highlight.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="features-heading"
          id="features"
          className="px-4 py-24 md:px-6"
        >
          <div className="mx-auto w-full max-w-4xl">
            <SectionHeading
              eyebrow="Features"
              id="features-heading"
              title="Everything you need to host, co-host & talk"
            />

            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className={`rounded-xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-md ${
                    feature.wide ? "lg:col-span-2" : ""
                  }`}
                >
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    <feature.icon
                      className="size-5 text-primary"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                  <FeatureMock mock={feature.mock} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="how-heading"
          id="how-it-works"
          className="border-t border-border bg-muted/30 px-4 py-24 md:px-6"
        >
          <div className="mx-auto w-full max-w-4xl">
            <SectionHeading
              eyebrow="How it works"
              id="how-heading"
              title="In the room in under 30 seconds"
            />

            <ol className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {STEPS.map((step, index) => (
                <li
                  key={step.title}
                  className="rounded-xl border border-border bg-card p-5 shadow-xs"
                >
                  <span className="font-mono text-xs font-medium text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="mt-3 flex size-8 items-center justify-center rounded-lg bg-muted">
                    <step.icon
                      className="size-4 text-foreground"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          aria-labelledby="faq-heading"
          id="faq"
          className="border-t border-border bg-muted/30 px-4 py-24 md:px-6"
        >
          <div className="mx-auto w-full max-w-2xl">
            <SectionHeading
              eyebrow="FAQ"
              id="faq-heading"
              title="Questions, answered"
            />

            <Accordion className="mt-10">
              {FAQS.map((faq) => (
                <AccordionItem key={faq.question} value={faq.question}>
                  <AccordionTrigger className="text-left font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section aria-labelledby="cta-heading" className="px-4 py-24 md:px-6">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
            <Eyebrow>Ready when you are</Eyebrow>
            <h2
              id="cta-heading"
              className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Hear the difference
            </h2>
            <p className="mt-4 max-w-xl text-base text-muted-foreground">
              Start your space, invite friends, delegate co-hosts, and talk.
              Zero accounts required.
            </p>
            <Button
              render={<Link href="/lobby" />}
              className="mt-8 h-11 px-6 text-sm shadow-md"
            >
              Enter Lobby
              <RiArrowRightLine />
            </Button>
          </div>
        </section>
      </main>

      <footer className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-24 z-0"
        >
          <div className="absolute left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        </div>

        {/* Generous bottom padding ensuring mobile floating navbar never overlaps footer text */}
        <div className="relative z-10 border-t border-border px-4 pb-36 sm:pb-32 md:px-6 md:pb-14">
          <div className="mx-auto w-full max-w-4xl">
            <div className="flex flex-col items-start justify-between gap-10 border-border py-14 md:flex-row md:items-center">
              <div className="max-w-sm">
                <p className="text-3xl font-bold tracking-tight md:text-4xl">
                  Hear the difference.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {site.name} is {site.tagline.toLowerCase()}. Built to feel
                  like you are in the room — not on a call.
                </p>
                <Button
                  render={<Link href="/lobby" />}
                  className="mt-6 h-9 px-4 text-sm"
                >
                  Enter Lobby
                  <RiArrowRightLine />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-8 sm:gap-10">
                <nav
                  aria-label="Product"
                  className="flex flex-col gap-2.5 text-sm"
                >
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Product
                  </p>
                  <Link
                    href="/lobby"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Lobby
                  </Link>
                  <Link
                    href="#features"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Features
                  </Link>
                  <Link
                    href="#how-it-works"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    How it works
                  </Link>
                  <Link
                    href="#faq"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    FAQ
                  </Link>
                </nav>

                <nav
                  aria-label="Creator"
                  className="flex flex-col gap-2.5 text-sm"
                >
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Creator
                  </p>
                  <a
                    href={site.creator.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <RiGlobalLine className="size-4" aria-hidden="true" />
                    {site.creator.handle}
                  </a>
                  <a
                    href={site.creator.social.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <RiGithubLine className="size-4" aria-hidden="true" />
                    GitHub
                  </a>
                  <a
                    href={site.creator.social.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <RiInstagramLine className="size-4" aria-hidden="true" />
                    Instagram
                  </a>
                  <a
                    href={site.creator.social.x}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <RiTwitterXLine className="size-4" aria-hidden="true" />X
                    (Twitter)
                  </a>
                  <a
                    href={site.creator.social.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <RiLinkedinLine className="size-4" aria-hidden="true" />
                    LinkedIn
                  </a>
                </nav>
              </div>
            </div>

            <div className="mx-auto flex w-full flex-col items-center justify-between gap-3 border-t border-border pt-6 md:flex-row">
              <p className="text-xs text-muted-foreground">
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
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {[
                  "Co-host delegation",
                  "60s Rejoin Timers",
                  "Real-time voice",
                  "Zero accounts",
                ].map((item, index) => (
                  <span key={item} className="flex items-center gap-1.5">
                    {index > 0 && (
                      <span className="text-border" aria-hidden="true">
                        /
                      </span>
                    )}
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
