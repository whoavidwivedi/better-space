import { describe, expect, it } from "bun:test"
import { getEndedSpace, isSpaceEnded, markSpaceEnded } from "./ended-spaces"

describe("ended spaces registry", () => {
  it("tracks ended spaces accurately", () => {
    const testRoom = `test-space-${Date.now()}-${Math.floor(Math.random() * 100000)}`
    expect(isSpaceEnded(testRoom)).toBe(false)
    expect(getEndedSpace(testRoom)).toBeNull()

    markSpaceEnded(testRoom, "Alice")

    expect(isSpaceEnded(testRoom)).toBe(true)
    const ended = getEndedSpace(testRoom)
    expect(ended).not.toBeNull()
    expect(ended?.host).toBe("Alice")
    expect(Object.keys(ended ?? {}).sort()).toEqual(["endedAt", "host", "name"])
  })

  it("handles case and whitespace normalization", () => {
    const unique = `mixed-${Date.now()}-${Math.floor(Math.random() * 100000)}`
    markSpaceEnded(`  ${unique}  `, "David")

    expect(isSpaceEnded(unique.toLowerCase())).toBe(true)
    expect(isSpaceEnded(`  ${unique.toUpperCase()}  `)).toBe(true)
  })
})
