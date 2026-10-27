import { redirect } from "next/navigation"

// A room's link (shared from inside a room, or older links) opens the lobby,
// which shows that room's Join panel if it is live, or Launch filled in with
// its name if not.
export default async function SpacePage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params
  redirect(`/lobby?space=${encodeURIComponent(decodeURIComponent(name))}`)
}
