export type StarterTemplate = {
  name: string
  title: string
  desc: string
  topic: string
  speakers: string[]
}

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    name: "techtwitter-india",
    title: "#TechTwitter India",
    desc: "Devs, founders, startups & craft discussions",
    topic: "Tech & Startups",
    speakers: ["OSLO-1", "Funny Bunny-2", "Upstream-3", "Afterclap-4"],
  },
  {
    name: "design-systems",
    title: "Design Systems & Motion",
    desc: "UI craft, design tokens & interactions",
    topic: "Design & UX",
    speakers: ["OSLO-1", "OSLO-3", "Upstream-2", "Afterclap-8"],
  },
  {
    name: "indie-founders",
    title: "Indie Founders & Shipping",
    desc: "Solo founders, micro-SaaS & launches",
    topic: "Startups & Build",
    speakers: ["Upstream-5", "Funny Bunny-2", "Teamwork-1"],
  },
]
