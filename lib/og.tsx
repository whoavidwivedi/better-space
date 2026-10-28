/* eslint-disable @next/next/no-img-element */
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

import { site } from "@/lib/site"

// Shared look for every route's Open Graph image: the landing page's dark
// stage, drawn at build time from the same brand, cast and copy.
export const ogSize = { width: 1200, height: 630 }

const CAST = [
  "Funny Bunny-3",
  "Afterclap-2",
  "OSLO-3",
  "Guacamole-1",
  "No gravity-2",
]

const dataUrl = async (path: string, type: string) =>
  `data:${type};base64,${(await readFile(join(process.cwd(), path))).toString("base64")}`

const userpic = (name: string) =>
  dataUrl(`public/Userpics/PNG/Circle/${name}.png`, "image/png")

// Geist as the site sets it. next/og bundles only Geist Regular, so a failed
// fetch (offline build) drops that weight and falls back to it rather than
// failing the build.
async function geist(weight: 400 | 600) {
  try {
    const css = await (
      await fetch(
        `https://fonts.googleapis.com/css2?family=Geist:wght@${weight}`
      )
    ).text()
    const url = css.match(/src: url\((.+?)\) format\('truetype'\)/)?.[1]
    if (!url) return []
    const data = await (await fetch(url)).arrayBuffer()
    return [{ name: "Geist", data, weight, style: "normal" as const }]
  } catch {
    return []
  }
}

export async function renderOg({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string
  title: string
  subtitle: string
}) {
  const [logo, cast, regular, semibold] = await Promise.all([
    dataUrl("app/icon.svg", "image/svg+xml"),
    Promise.all(CAST.map(userpic)),
    geist(400),
    geist(600),
  ])
  const host = new URL(site.url).host

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        fontFamily: "Geist",
        color: "#fafafa",
        backgroundColor: "#0a0a0a",
        backgroundImage:
          "radial-gradient(circle at 50% -20%, #2a2a2a 0%, transparent 60%), linear-gradient(#ffffff0d 1px, transparent 1px), linear-gradient(90deg, #ffffff0d 1px, transparent 1px)",
        backgroundSize: "100% 100%, 64px 64px, 64px 64px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <img
          src={logo}
          width={56}
          height={56}
          style={{ borderRadius: 999, border: "2px solid #3f3f46" }}
          alt=""
        />
        <div
          style={{
            display: "flex",
            fontSize: 34,
            fontWeight: 600,
            letterSpacing: -1,
          }}
        >
          better
          <span style={{ color: "#a1a1aa", marginLeft: 6 }}>space</span>
        </div>
        <div
          style={{
            display: "flex",
            marginLeft: "auto",
            padding: "8px 18px",
            borderRadius: 12,
            border: "1px solid #3f3f46",
            backgroundColor: "#18181b",
            color: "#d4d4d8",
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            display: "flex",
            fontSize: 76,
            lineHeight: 1.05,
            letterSpacing: -3,
            fontWeight: 600,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            lineHeight: 1.4,
            color: "#a1a1aa",
            maxWidth: 920,
          }}
        >
          {subtitle}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ display: "flex" }}>
          {cast.map((src, i) => (
            <img
              key={i}
              src={src}
              width={56}
              height={56}
              alt=""
              style={{
                marginLeft: i ? -16 : 0,
                borderRadius: 999,
                border: "4px solid #0a0a0a",
                backgroundColor: "#fafafa",
              }}
            />
          ))}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginLeft: 20,
            fontSize: 22,
            color: "#d4d4d8",
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              backgroundColor: "#34d399",
            }}
          />
          No account · Nothing recorded · Any device
        </div>
        <div
          style={{
            display: "flex",
            marginLeft: "auto",
            fontSize: 22,
            color: "#71717a",
          }}
        >
          {host}
        </div>
      </div>
    </div>,
    { ...ogSize, fonts: [...regular, ...semibold] }
  )
}
