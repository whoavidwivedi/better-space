import { renderOg, ogSize } from "@/lib/og"
import { site } from "@/lib/site"

export const alt = `${site.name}: ${site.tagline}`
export const size = ogSize
export const contentType = "image/png"

export default function Image() {
  return renderOg({
    eyebrow: "Live voice rooms",
    title: "Voice spaces for real-time conversations.",
    subtitle: site.description,
  })
}
