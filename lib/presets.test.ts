import { describe, expect, test } from "bun:test"

import {
  ROOM_CODE_PATTERN,
  ROOM_NAME_MAX,
  ROOM_SLUG_PATTERN,
  STARTER_TEMPLATES,
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
  test("matches by name and title", () => {
    expect(findTemplate("design-systems-motion-craft")?.name).toBe(
      "design-systems-motion-craft"
    )
    expect(findTemplate("Design Systems, Motion & Craft")?.name).toBe(
      "design-systems-motion-craft"
    )
  })
  test("returns undefined for unknown input", () => {
    expect(findTemplate("does-not-exist")).toBeUndefined()
  })
})

describe("templates", () => {
  test("each name is exactly the slug of the title it shows", () => {
    for (const t of STARTER_TEMPLATES) {
      expect(t.name).toBe(toSlug(t.title))
      expect(t.name.length).toBeLessThanOrEqual(ROOM_NAME_MAX)
      expect(ROOM_SLUG_PATTERN.test(generateRoomSlug(t.name))).toBe(true)
    }
  })
  test("a launched template room still matches its template", () => {
    expect(findTemplate("design-systems-motion-craft-ab12cd")?.name).toBe(
      "design-systems-motion-craft"
    )
  })
  test("partial or edited names are rooms of their own", () => {
    for (const name of [
      "a",
      "craft",
      "design",
      "design-systems",
      "design-systems-motion",
      "design-systems-motion-ab12cd",
      "my-design-room",
      "design-systems-motion-craft-2",
    ]) {
      expect(findTemplate(name)).toBeUndefined()
    }
  })
})

describe("ROOM_SLUG_PATTERN", () => {
  test("rejects empty, too long and unsafe names", () => {
    expect(ROOM_SLUG_PATTERN.test("")).toBe(false)
    expect(ROOM_SLUG_PATTERN.test("a".repeat(ROOM_NAME_MAX + 8))).toBe(false)
    expect(ROOM_SLUG_PATTERN.test("../admin")).toBe(false)
    expect(ROOM_SLUG_PATTERN.test("room name")).toBe(false)
  })
})
