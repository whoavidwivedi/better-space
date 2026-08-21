const HOST_ONLY_ACTIONS = new Set(["grant_cohost", "revoke_cohost"])

export function canPerformModerationAction(
  action: string,
  isHost: boolean,
  isCohost: boolean
): boolean {
  if (!isHost && !isCohost) return false
  return isHost || !HOST_ONLY_ACTIONS.has(action)
}
