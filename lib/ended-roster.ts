export type EndedSpaceParticipant = {
  identity: string
  name?: string
  avatar?: string
  isHost?: boolean
}

export function snapshotEndedSpeaker(
  participant: { identity: string; name?: string; metadata?: string },
  hostIdentity: string
): EndedSpaceParticipant {
  let avatar: string | undefined
  try {
    const metadata = JSON.parse(participant.metadata || "{}")
    if (typeof metadata.avatar === "string") avatar = metadata.avatar
  } catch {}

  return {
    identity: participant.identity,
    name: participant.name || participant.identity,
    avatar,
    isHost: participant.identity === hostIdentity,
  }
}

export function readEndedRoster(value: unknown): EndedSpaceParticipant[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((entry) => {
    if (typeof entry === "string") return [{ identity: entry }]
    if (!entry || typeof entry.identity !== "string") return []
    return [
      {
        identity: entry.identity,
        name: typeof entry.name === "string" ? entry.name : undefined,
        avatar: typeof entry.avatar === "string" ? entry.avatar : undefined,
        isHost: typeof entry.isHost === "boolean" ? entry.isHost : undefined,
      },
    ]
  })
}
