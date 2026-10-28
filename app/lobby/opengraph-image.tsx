import { renderOg, ogSize } from "@/lib/og"
import { site } from "@/lib/site"

export const alt = `${site.name} lobby`
export const size = ogSize
export const contentType = "image/png"

export default function Image() {
  return renderOg({
    eyebrow: "Lobby",
    title: "Join a live room, or launch your own.",
    subtitle:
      "See who is talking right now and drop in with one click. No sign-up.",
  })
}
