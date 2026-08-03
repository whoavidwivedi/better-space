import { site } from "@/lib/site"
import {
  RiEmotionHappyLine,
  RiEqualizerLine,
  RiGithubLine,
  RiGlobalLine,
  RiGroupLine,
  RiKeyboardBoxLine,
  RiLinkedinLine,
  RiMic2Line,
  RiShieldCheckLine,
  RiSoundModuleLine,
  RiSparklingLine,
  RiTwitterXLine,
  RiUserAddLine,
  RiVoiceprintLine,
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
import { Button } from "@/components/ui/button"

const STATS = [
  { label: "Audio Latency", value: "< 50ms", icon: RiWifiLine },
  { label: "Account Friction", value: "Zero", icon: RiUserAddLine },
  { label: "Noise Filter", value: "Built-in", icon: RiSparklingLine },
  { label: "Browser Support", value: "100%", icon: RiGlobalLine },
]

const FEATURES = [
  {
    title: "Lossless Studio Audio",
    description:
      "Crystal-clear voice powered by WebRTC and LiveKit, equipped with advanced background noise suppression and real-time echo cancellation.",
    icon: RiVoiceprintLine,
    badge: "Studio Quality",
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
      "Audio streams over secure, low-latency WebRTC channels powered by LiveKit Cloud. We incorporate advanced noise suppression to eliminate background chatter, fan noise, and keyboard clicks automatically.",
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

export default function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section
          aria-labelledby="hero-heading"
          className="px-4 py-24 md:px-6 md:py-32 flex flex-col items-center"
        >
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
            <Eyebrow>
              Live WebRTC Voice Spaces
            </Eyebrow>

            <h1
              id="hero-heading"
              className="mt-8 text-4xl font-bold tracking-tight text-balance sm:text-6xl"
            >
              Talk in real-time.<br />
              <span className="text-muted-foreground">No accounts needed.</span>
            </h1>

            <p className="text-muted-foreground mt-6 max-w-xl text-base sm:text-lg leading-relaxed">
              Better Space is a high-fidelity spatial voice room built for teams, creators, and friends. 
              Equipped with advanced noise cancellation, live reactions, and instant link sharing.
            </p>

            <div className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
              <Button
                render={<Link href="/lobby" />}
                className="h-11 px-6 text-sm sm:w-auto"
              >
                Enter Lobby
              </Button>
              <Button
                variant="outline"
                render={<Link href="#how-it-works" />}
                className="h-11 px-6 text-sm sm:w-auto"
              >
                How it works
              </Button>
            </div>
          </div>
        </section>

        {/* Quick Stats Bar */}
        <section
          aria-label="Platform Highlights"
          className="border-border border-y px-4 py-8 md:px-6"
        >
          <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center">
                <span className="text-2xl font-bold tracking-tight">{stat.value}</span>
                <span className="text-muted-foreground mt-1 text-xs font-medium">{stat.label}</span>
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

            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="flex flex-col">
                  <div className="bg-muted flex size-12 items-center justify-center rounded-xl mb-4">
                    <feature.icon className="text-primary size-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight">{feature.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section
          aria-labelledby="how-heading"
          id="how-it-works"
          className="border-border border-t px-4 py-24 md:px-6"
        >
          <div className="mx-auto w-full max-w-5xl">
            <SectionHeading
              eyebrow="How It Works"
              id="how-heading"
              title="In the room in three simple steps"
              description="Skip signups and downloads. Jump straight into the conversation."
            />

            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
              {STEPS.map((step) => (
                <div
                  key={step.step}
                  className="relative flex flex-col"
                >
                  <span className="text-muted-foreground/60 font-mono text-xs font-bold mb-4">
                    STEP {step.step}
                  </span>
                  <h3 className="text-lg font-semibold tracking-tight">{step.title}</h3>
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
          className="border-border border-t px-4 py-24 md:px-6"
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
        <section aria-labelledby="cta-heading" className="px-4 py-28 md:px-6">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
            <h2 id="cta-heading" className="text-3xl font-bold tracking-tight sm:text-5xl">
              Ready to talk?
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl text-base sm:text-lg">
              Start a new space or drop into an ongoing conversation. Completely free.
            </p>
            <Button
              render={<Link href="/lobby" />}
              className="mt-8 h-12 px-7 text-base font-semibold"
            >
              Enter Lobby
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-border border-t px-4 pb-20 md:px-6 md:pb-12">
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
              <span>Noise Suppression</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
