import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

// iOS home screens and the manifest need a PNG; draw the SVG icon onto one.
export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default async function AppleIcon() {
  const svg = await readFile(join(process.cwd(), "app/icon.svg"))
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "#ffffff",
      }}
    >
      <img
        src={`data:image/svg+xml;base64,${svg.toString("base64")}`}
        width={180}
        height={180}
        alt=""
      />
    </div>,
    size
  )
}
