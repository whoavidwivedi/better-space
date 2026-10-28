import type { Metadata } from "next"

import { pageMetadata } from "@/lib/site"

export const metadata: Metadata = pageMetadata({
  title: "Lobby",
  description:
    "Browse live voice rooms and join one in a click, or launch your own space. No sign-up, nothing recorded.",
  path: "/lobby",
})

export default function LobbyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
