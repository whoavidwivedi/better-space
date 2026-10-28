import { renderOg, ogSize } from "@/lib/og"
import { site } from "@/lib/site"

export const alt = `${site.name} changelog`
export const size = ogSize
export const contentType = "image/png"

export default function Image() {
  return renderOg({
    eyebrow: "Changelog",
    title: "Every release, in public.",
    subtitle: `New features, improvements and fixes shipped to ${site.name}.`,
  })
}
