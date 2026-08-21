import { describe, expect, test } from "bun:test"
import {
  decryptCohostSecrets,
  encryptCohostSecrets,
  hasCohostAccess,
} from "./space-auth"

process.env.LIVEKIT_API_SECRET = "test-secret"

describe("hasCohostAccess", () => {
  const meta = {
    cohosts: ["Ada"],
    cohostSecretsEncrypted: encryptCohostSecrets({ Ada: "secret-123" }),
  }

  test("accepts the assigned cohost secret", () => {
    expect(hasCohostAccess(meta, "Ada", "secret-123")).toBe(true)
  })

  test("rejects a matching name with the wrong secret", () => {
    expect(hasCohostAccess(meta, "Ada", "wrong-secret")).toBe(false)
  })

  test("rejects a cohost without a stored secret", () => {
    expect(hasCohostAccess({ cohosts: ["Ada"] }, "Ada", "secret-123")).toBe(
      false
    )
  })

  test("rejects a non-cohost with a valid secret", () => {
    expect(hasCohostAccess(meta, "Grace", "secret-123")).toBe(false)
  })
})

describe("cohost secret encryption", () => {
  test("does not store the plaintext secret in the encrypted value", () => {
    const encrypted = encryptCohostSecrets({ Ada: "secret-123" })
    expect(encrypted).not.toContain("secret-123")
    expect(decryptCohostSecrets(encrypted)).toEqual({ Ada: "secret-123" })
  })

  test("rejects tampered encrypted data", () => {
    expect(decryptCohostSecrets("invalid.payload.value")).toEqual({})
  })
})
