import { site } from "@/lib/site"
import {
  RiArrowRightLine,
  RiCheckLine,
  RiCommandLine,
  RiEmotionHappyLine,
  RiEqualizerLine,
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
  RiSoundModuleLine,
  RiSparklingLine,
  RiTwitterXLine,
  RiUserAddLine,
  RiUserUnfollowLine,
  RiVoiceprintLine,
  RiVolumeMuteLine,
  RiVolumeUpLine,
  RiWifiLine,
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Kbd, KbdGroup } from "@/components/ui/kbd"

const SPEAKERS = [
  { name: "Maya", role: "Host", speaking: true, muted: false, host: true, listener: false },
  { name: "Theo", role: "Speaker", speaking: false, muted: false, listener: false },
  { name: "Rina", role: "Speaker", speaking: false, muted: true, listener: false },
  { name: "Sam", role: "Speaker", speaking: false, muted: false, listener: false },
  { name: "Zoe", role: "Listener", speaking: false, muted: true, listener: true },
  { name: "Kai", role: "Listener", speaking: false, muted: true, listener: true },
]

const STATS = [
  { label: "Audio Latency", value: "< 50ms", icon: RiWifiLine },
  { label: "Account Friction", value: "Zero", icon: RiUserAddLine },
  { label: "Noise Filter", value: "AI-Powered", icon: RiSparklingLine },
  { label: "Browser Support", value: "100%", icon: RiGlobalLine },
]

const FEATURES = [
  {
    title: "Lossless Studio Audio",
    description:
      "Crystal-clear voice powered by WebRTC and LiveKit, equipped with Krisp AI background noise suppression and real-time echo cancellation.",
    icon: RiVoiceprintLine,
    badge: "AI Powered",
    wide: true,
    mock: "audio" as const,
  },
  {
    title: "Device Management & Audio Test",
    description:
      "Seamlessly switch microphones and speakers with a live input level meter and built-in sound check chime.",
    icon: RiSoundModuleLine,
    badge: "New",
    wide: false,
    mock: "device" as const,
  },
  {
    title: "Zero-Account Onboarding",
    description: "Pick a nickname and join in one click. No passwords, no credit cards, no tracking.",
    icon: RiUserAddLine,
    badge: null,
    wide: false,
    mock: null,
  },
  {
    title: "Host & Moderation Suite",
    description:
      "Grant or revoke microphones, mute individual speakers, appoint co-hosts, and maintain full room governance.",
    icon: RiShieldCheckLine,
    badge: "Moderation",
    wide: true,
    mock: "host" as const,
  },
  {
    title: "Live Room Reactions",
    description: "Send floating emoji reactions in real-time to celebrate, agree, or react without interrupting speech.",
    icon: RiEmotionHappyLine,
    badge: null,
    wide: false,
    mock: "reactions" as const,
  },
  {
    title: "Pro Keyboard Shortcuts",
    description: "Toggle mic, deafen room audio, or raise your hand effortlessly from your keyboard.",
    icon: RiKeyboardBoxLine,
    badge: "Fast",
    wide: true,
    mock: "shortcuts" as const,
  },
]

const STEPS = [
  {
    step: "01",
    title: "Enter the Lobby",
    description: "Explore ongoing public spaces or launch your own room in seconds.",
    icon: RiGroupLine,
  },
  {
    step: "02",
    title: "Pick your Name & Devices",
    description: "Choose your audio input/output devices and test your levels before speaking.",
    icon: RiEqualizerLine,
  },
  {
    step: "03",
    title: "Talk & Collaborate",
    description: "Engage in ultra-low latency spatial voice conversation with zero friction.",
    icon: RiMic2Line,
  },
]

const FAQS = [
  {
    question: "Do I need to create an account or sign in?",
    answer:
      "No. Better Space is completely account-free. Enter any nickname, and you are immediately placed into the space. No signup, no passwords, and nothing stored on external databases.",
  },
  {
    question: "How does the audio quality and noise cancellation work?",
    answer:
      "Audio streams over secure, low-latency WebRTC channels powered by LiveKit Cloud. We incorporate Krisp AI neural noise suppression to eliminate background chatter, fan noise, and keyboard clicks automatically.",
  },
  {
    question: "Can I test my microphone and output speakers before joining?",
    answer:
      "Yes! Better Space includes a full audio settings panel with real-time mic volume metering, input/output device selector, and a native Web Audio speaker test chime.",
  },
  {
    question: "What powers host controls and moderation?",
    answer:
      "The room creator receives host permissions to grant microphone access, mute speakers, kick disruptive participants, and assign co-hosts directly from the participant drawer.",
  },
  {
    question: "Is Better Space free to use?",
    answer:
      "Yes, Better Space is free and open-source during our public release.",
  },
]

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="border-border bg-muted/60 text-muted-foreground inline-flex h-8 items-center gap-2 rounded-full border px-4 text-xs font-medium backdrop-blur-sm">
      {children}
    </span>
  )
}

function SectionHeading({ eyebrow, id, title, description }: { eyebrow: string; id: string; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 id={id} className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="text-muted-foreground mt-3 max-w-xl text-base sm:text-lg">
          {description}
        </p>
      )}
    </div>
  )
}

function HeroVisual() {
  return (
    <div className="mt-14 w-full max-w-xl">
      <div className="bg-card/90 border-border/80 relative rounded-2xl border p-6 text-left shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2.5">
            <span className="bg-success size-2.5 animate-pulse rounded-full" />
            <span className="text-sm font-semibold tracking-tight">design-sync</span>
            <Badge variant="outline" className="bg-muted/50 text-[10px] font-medium">
              LiveKit 28ms
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-success/10 text-success border-success/20 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium">
              <RiSparklingLine className="size-3" />
              AI Noise Filter On
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          {SPEAKERS.map((speaker) => (
            <div key={speaker.name} className="flex flex-col items-center gap-2">
              <div className="relative">
                <div
                  className={`rounded-full transition-all duration-300 ${
                    speaker.speaking
                      ? "ring-success ring-offset-background ring-2 ring-offset-2 scale-105"
                      : speaker.host
                        ? "ring-primary ring-offset-background ring-2 ring-offset-2"
                        : ""
                  }`}
                >
                  <Avatar className="border-border bg-muted size-14 border shadow-sm">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/notionists/svg?seed=${speaker.name.toLowerCase()}&backgroundColor=ffffff`}
                      alt={speaker.name}
                      className="object-contain"
                    />
                    <AvatarFallback>{speaker.name[0]}</AvatarFallback>
                  </Avatar>
                </div>
                {!speaker.listener && (
                  <span className="bg-background border-border absolute -right-1 -bottom-1 rounded-full border p-0.5 shadow-xs">
                    {speaker.muted ? (
                      <RiMicOffLine className="text-muted-foreground size-3.5" aria-hidden="true" />
                    ) : (
                      <RiMic2Line className="text-primary size-3.5" aria-hidden="true" />
                    )}
                  </span>
                )}
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold">
                {speaker.name}
                {speaker.host && (
                  <span className="bg-primary/10 text-primary rounded px-1 text-[9px] font-bold">
                    HOST
                  </span>
                )}
              </span>
              <span className="text-muted-foreground -mt-1 flex items-center gap-0.5 text-[10px]">
                {speaker.speaking ? (
                  <span className="text-success font-medium flex items-center gap-1">
                    <span className="flex gap-0.5 items-center">
                      <span className="size-1 bg-success rounded-full animate-bounce" />
                      <span className="size-1 bg-success rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="size-1 bg-success rounded-full animate-bounce [animation-delay:0.4s]" />
                    </span>
                    Speaking
                  </span>
                ) : speaker.listener ? (
                  <>
                    <RiHeadphoneLine className="size-3" aria-hidden="true" />
                    Listener
                  </>
                ) : (
                  "Speaker"
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Floating reaction simulation */}
        <div className="absolute top-20 right-6 flex flex-col gap-1.5 animate-pulse">
          <span className="bg-card border-border shadow-md rounded-full px-2.5 py-1 text-xs font-medium border flex items-center gap-1">
            <span>🔥</span>
            <span className="text-[10px] text-muted-foreground">Theo reacted</span>
          </span>
        </div>

        <div className="border-border mt-6 flex items-center gap-2 border-t pt-4">
          <span className="bg-muted/80 text-muted-foreground flex h-9 min-w-0 flex-1 items-center gap-1.5 rounded-lg px-3 text-xs font-medium">
            <RiLinksLine className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">better.space/space/design-sync</span>
          </span>
          <span className="bg-primary text-primary-foreground flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs font-medium shadow-xs">
            <RiVolumeUpLine className="size-4" aria-hidden="true" />
            Deafen
          </span>
          <span className="bg-muted hover:bg-muted/80 text-muted-foreground flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors">
            <RiEmotionHappyLine className="size-4" aria-hidden="true" />
            React
          </span>
        </div>
      </div>
    </div>
  )
}

function FeatureMock({ mock }: { mock: "audio" | "device" | "host" | "reactions" | "shortcuts" | null }) {
  if (mock === "audio") {
    return (
      <div className="bg-muted/40 border-border mt-5 flex flex-col gap-3 rounded-lg border p-3.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
            <RiSparklingLine className="text-primary size-4" />
            Krisp AI Noise Suppression
          </span>
          <span className="text-success font-medium flex items-center gap-1">
            <RiCheckLine className="size-3.5" />
            Active
          </span>
        </div>
        <div className="flex items-center gap-1 h-4">
          {[40, 75, 30, 95, 60, 85, 45, 100, 70, 50, 80, 65, 30, 90, 45, 80].map((h, i) => (
            <div
              key={i}
              className="bg-primary/80 flex-1 rounded-full"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (mock === "device") {
    return (
      <div className="bg-muted/40 border-border mt-5 flex flex-col gap-2.5 rounded-lg border p-3.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground font-medium">Mic Input</span>
          <span className="text-foreground font-semibold">MacBook Pro Mic</span>
        </div>
        <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
          <div className="bg-success h-full w-3/4 rounded-full" />
        </div>
        <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
          <span>Speaker Output</span>
          <span className="text-primary font-medium flex items-center gap-1">
            <RiVolumeUpLine className="size-3" />
            Test Chime
          </span>
        </div>
      </div>
    )
  }

  if (mock === "host") {
    return (
      <div className="mt-5 flex flex-wrap gap-2">
        <span className="text-success border-success/20 bg-success/10 flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium">
          <RiMicLine className="size-3.5" aria-hidden="true" />
          Grant Mic
        </span>
        <span className="border-border bg-muted text-muted-foreground flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium">
          <RiVolumeMuteLine className="size-3.5" aria-hidden="true" />
          Mute Speaker
        </span>
        <span className="text-destructive border-destructive/20 bg-destructive/10 flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium">
          <RiUserUnfollowLine className="size-3.5" aria-hidden="true" />
          Remove
        </span>
      </div>
    )
  }

  if (mock === "reactions") {
    return (
      <div className="mt-5 flex items-center gap-2">
        {["🔥", "👏", "❤️", "🎉", "💡", "😂"].map((emoji) => (
          <span
            key={emoji}
            className="border-border bg-card hover:scale-110 flex size-8 items-center justify-center rounded-lg border text-sm shadow-xs transition-transform"
          >
            {emoji}
          </span>
        ))}
      </div>
    )
  }

  if (mock === "shortcuts") {
    return (
      <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
        <div className="border-border bg-muted/40 flex items-center justify-between rounded-lg border p-2.5">
          <span className="text-muted-foreground font-medium">Toggle Mic</span>
          <KbdGroup>
            <Kbd>&#8984;</Kbd>
            <Kbd>D</Kbd>
          </KbdGroup>
        </div>
        <div className="border-border bg-muted/40 flex items-center justify-between rounded-lg border p-2.5">
          <span className="text-muted-foreground font-medium">Deafen Audio</span>
          <KbdGroup>
            <Kbd>&#8984;</Kbd>
            <Kbd>E</Kbd>
          </KbdGroup>
        </div>
      </div>
    )
  }

  return null
}

export default function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section
          aria-labelledby="hero-heading"
          className="relative isolate min-h-[90vh] overflow-hidden px-4 pt-24 pb-20 md:px-6 flex flex-col justify-center items-center"
        >
          {/* Ambient background aura */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[36rem] w-[45rem] -translate-x-1/2 rounded-full bg-radial from-primary/15 via-primary/5 to-transparent blur-3xl"
          />

          <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
            <Eyebrow>
              <span className="bg-success size-2 rounded-full animate-pulse" />
              Live WebRTC Voice Spaces
            </Eyebrow>

            <h1
              id="hero-heading"
              className="mt-6 text-5xl font-extrabold tracking-tight text-balance sm:text-7xl lg:text-8xl"
            >
              Talk in real-time.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground">
                No accounts needed.
              </span>
            </h1>

            <p className="text-muted-foreground mt-6 max-w-2xl text-lg sm:text-xl font-normal leading-relaxed">
              Better Space is a high-fidelity spatial voice room built for teams, creators, and friends. 
              Equipped with Krisp AI noise cancellation, live reactions, and instant link sharing.
            </p>

            <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
              <Button
                render={<Link href="/lobby" />}
                className="h-11 w-full max-w-xs px-6 text-sm font-semibold shadow-lg sm:w-auto transition-all hover:scale-[1.02]"
              >
                Enter Lobby
                <RiArrowRightLine className="size-4 ml-1" />
              </Button>
              <Button
                variant="outline"
                render={<Link href="#how-it-works" />}
                className="h-11 w-full max-w-xs px-5 text-sm sm:w-auto"
              >
                How it works
              </Button>
            </div>

            <HeroVisual />
          </div>
        </section>

        {/* Quick Stats Bar */}
        <section
          aria-label="Platform Highlights"
          className="border-border border-y bg-muted/30 px-4 py-8 md:px-6"
        >
          <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center">
                <stat.icon className="text-primary size-5 mb-1 opacity-80" aria-hidden="true" />
                <span className="text-2xl font-bold tracking-tight">{stat.value}</span>
                <span className="text-muted-foreground text-xs font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Features Bento Grid */}
        <section aria-labelledby="features-heading" id="features" className="px-4 py-24 md:px-6">
          <div className="mx-auto w-full max-w-5xl">
            <SectionHeading
              eyebrow="Features"
              id="features-heading"
              title="Everything you need to talk freely"
              description="Engineered for crystal-clear fidelity, zero latency, and effortless collaboration."
            />

            <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className={`bg-card border-border hover:border-border/80 flex flex-col rounded-2xl border p-6 shadow-xs transition-all ${
                    feature.wide ? "lg:col-span-2" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="bg-muted/80 flex size-10 items-center justify-center rounded-xl">
                      <feature.icon className="text-primary size-5" aria-hidden="true" />
                    </div>
                    {feature.badge && (
                      <Badge variant="secondary" className="text-[10px] font-medium">
                        {feature.badge}
                      </Badge>
                    )}
                  </div>
                  <h3 className="mt-4 text-base font-semibold tracking-tight">{feature.title}</h3>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-auto">
                    <FeatureMock mock={feature.mock} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section
          aria-labelledby="how-heading"
          id="how-it-works"
          className="border-border bg-muted/40 border-t px-4 py-24 md:px-6"
        >
          <div className="mx-auto w-full max-w-5xl">
            <SectionHeading
              eyebrow="How It Works"
              id="how-heading"
              title="In the room in three simple steps"
              description="Skip signups and downloads. Jump straight into the conversation."
            />

            <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {STEPS.map((step) => (
                <div
                  key={step.step}
                  className="bg-card border-border relative flex flex-col rounded-2xl border p-6 shadow-xs"
                >
                  <span className="text-muted-foreground/60 font-mono text-xs font-bold">
                    STEP {step.step}
                  </span>
                  <div className="bg-muted/80 my-4 flex size-10 items-center justify-center rounded-xl">
                    <step.icon className="text-primary size-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-semibold tracking-tight">{step.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section
          aria-labelledby="faq-heading"
          id="faq"
          className="border-border bg-muted/20 border-t px-4 py-24 md:px-6"
        >
          <div className="mx-auto w-full max-w-2xl">
            <SectionHeading
              eyebrow="FAQ"
              id="faq-heading"
              title="Frequently Asked Questions"
              description="Everything you need to know about Better Space."
            />

            <Accordion className="mt-12">
              {FAQS.map((faq) => (
                <AccordionItem key={faq.question} value={faq.question} className="border-border">
                  <AccordionTrigger className="text-left font-medium text-sm sm:text-base">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground text-sm leading-relaxed">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Call to Action */}
        <section aria-labelledby="cta-heading" className="relative px-4 py-28 md:px-6 overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -bottom-20 -z-10 h-64 bg-radial from-primary/10 to-transparent blur-3xl"
          />

          <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
            <Eyebrow>Instant Access</Eyebrow>
            <h2 id="cta-heading" className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
              Ready to talk?
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl text-base sm:text-lg">
              Start a new space or drop into an ongoing conversation. Completely free.
            </p>
            <Button
              render={<Link href="/lobby" />}
              className="mt-8 h-12 px-7 text-base font-semibold shadow-xl"
            >
              Enter Lobby
              <RiArrowRightLine className="ml-1 size-5" />
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-border relative z-10 border-t bg-card/50 px-4 pb-20 md:px-6 md:pb-12">
        <div className="mx-auto w-full max-w-5xl pt-14">
          <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-center">
            <div className="max-w-sm">
              <div className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground size-7 flex items-center justify-center rounded-lg font-bold text-sm">
                  B
                </span>
                <span className="font-bold text-lg">{site.name}</span>
              </div>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                {site.name} is {site.tagline.toLowerCase()}. Built to feel like you are in the
                same room — not on a call.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-10">
              <nav aria-label="Product Links" className="flex flex-col gap-2.5 text-sm">
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

              <nav aria-label="Social Links" className="flex flex-col gap-2.5 text-sm">
                <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  Connect
                </p>
                <a
                  href={site.creator.website}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground text-muted-foreground inline-flex items-center gap-1.5 transition-colors"
                >
                  <RiGlobalLine className="size-4" aria-hidden="true" />
                  Website
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
                  href={site.creator.social.x}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground text-muted-foreground inline-flex items-center gap-1.5 transition-colors"
                >
                  <RiTwitterXLine className="size-4" aria-hidden="true" />
                  Twitter
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

          <div className="border-border mt-12 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs text-muted-foreground md:flex-row">
            <p>
              &copy; {new Date().getFullYear()} {site.name}. Crafted by{" "}
              <a
                href={site.creator.website}
                target="_blank"
                rel="noreferrer"
                className="text-foreground hover:underline"
              >
                {site.creator.handle}
              </a>
              .
            </p>
            <div className="flex items-center gap-2">
              <span>Zero accounts</span>
              <span>•</span>
              <span>LiveKit WebRTC</span>
              <span>•</span>
              <span>Krisp AI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
