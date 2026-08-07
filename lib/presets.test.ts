import { describe, expect, test } from "bun:test"

import {
  ROOM_CODE_PATTERN,
  findTemplate,
  generateRoomSlug,
  genRoomCode,
  stripRoomCode,
  toSlug,
} from "@/lib/presets"

describe("toSlug", () => {
  test("lowercases and joins on non-alphanumeric", () => {
    expect(toSlug("Tech Talk 2026!")).toBe("tech-talk-2026")
  })
  test("trims leading/trailing separators", () => {
    expect(toSlug("  #Diverse--World  ")).toBe("diverse-world")
  })
  test("returns empty for empty input", () => {
    expect(toSlug("")).toBe("")
  })
})

describe("genRoomCode", () => {
  test("produces a 6 char slug-safe code", () => {
    const code = genRoomCode()
    expect(code).toHaveLength(6)
    expect(code).toMatch(/^[a-z0-9]{6}$/)
  })
})

describe("generateRoomSlug", () => {
  test("appends a room code to the slugged base", () => {
    const slug = generateRoomSlug("My Space")
    expect(slug).toMatch(/^my-space-[a-z0-9]{6}$/)
  })
})

describe("stripRoomCode", () => {
  test("removes a trailing room code", () => {
    expect(stripRoomCode("my-space-ab12cd")).toBe("my-space")
  })
  test("returns the value unchanged when there is no code", () => {
    expect(stripRoomCode("just-a-name")).toBe("just-a-name")
  })
})

describe("ROOM_CODE_PATTERN", () => {
  test("matches a 6-char suffix", () => {
    expect(ROOM_CODE_PATTERN.exec("my-space-ab12cd")).not.toBeNull()
    expect("my-space-ab12cd".replace(ROOM_CODE_PATTERN, "")).toBe("my-space")
  })
})

describe("findTemplate", () => {
  test("matches by slug, alias and title", () => {
    expect(findTemplate("design-systems")?.name).toBe(
      "design-systems-motion-craft"
    )
    expect(findTemplate("design")?.name).toBe("design-systems-motion-craft")
    expect(findTemplate("Design Systems, Motion & Craft")?.name).toBe(
      "design-systems-motion-craft"
    )
  })
  test("returns undefined for unknown input", () => {
    expect(findTemplate("does-not-exist")).toBeUndefined()
  })
})
