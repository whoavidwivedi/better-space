import { describe, expect, test } from "bun:test"
import { canPerformModerationAction } from "./moderation-auth"

describe("canPerformModerationAction", () => {
  test("allows the host to perform every moderation action", () => {
    expect(canPerformModerationAction("end", true, false)).toBe(true)
    expect(canPerformModerationAction("grant_cohost", true, false)).toBe(true)
  })

  test("allows a cohost to moderate and end a space", () => {
    expect(canPerformModerationAction("end", false, true)).toBe(true)
    expect(canPerformModerationAction("kick", false, true)).toBe(true)
  })

  test("keeps cohost management host-only", () => {
    expect(canPerformModerationAction("grant_cohost", false, true)).toBe(false)
    expect(canPerformModerationAction("revoke_cohost", false, true)).toBe(false)
  })

  test("rejects regular participants", () => {
    expect(canPerformModerationAction("end", false, false)).toBe(false)
  })
})
