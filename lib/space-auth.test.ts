import { describe, expect, test } from "bun:test"
import {
  decryptCohostSecrets,
  decryptSpaceSecret,
  encryptCohostSecrets,
  encryptSpaceSecret,
  hasCohostAccess,
  hasHostAccess,
} from "./space-auth"

process.env.LIVEKIT_API_SECRET = "test-secret"

describe("host access", () => {
  test("encrypts and decrypts host secrets", () => {
    const secret = "host-secret-123"
    const encrypted = encryptSpaceSecret(secret)

    expect(encrypted).not.toContain(secret)
    expect(decryptSpaceSecret(encrypted)).toBe(secret)
  })

  test("accepts the correct host identity and secret", () => {
    const meta = {
      host: "Avi",
      hostSecretEncrypted: encryptSpaceSecret("secret-123"),
    }

    expect(hasHostAccess(meta, "Avi", "secret-123")).toBe(true)
  })

  test("rejects a host with the wrong secret", () => {
    const meta = {
      host: "Avi",
      hostSecretEncrypted: encryptSpaceSecret("secret-123"),
    }

    expect(hasHostAccess(meta, "Avi", "wrong-secret")).toBe(false)
  })

  test("rejects another identity with a valid host secret", () => {
    const meta = {
      host: "Avi",
      hostSecretEncrypted: encryptSpaceSecret("secret-123"),
    }

    expect(hasHostAccess(meta, "Other", "secret-123")).toBe(false)
  })

  test("keeps legacy plaintext host secrets working", () => {
    const meta = { host: "Avi", hostSecret: "legacy-secret" }

    expect(hasHostAccess(meta, "Avi", "legacy-secret")).toBe(true)
    expect(hasHostAccess(meta, "Avi", "wrong-secret")).toBe(false)
  })
})

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
