import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  timingSafeEqual,
} from "node:crypto"

type CohostMetadata = {
  cohosts?: unknown
  cohostSecretsEncrypted?: unknown
}

type HostMetadata = {
  host?: unknown
  hostSecret?: unknown
  hostSecretEncrypted?: unknown
}

export function roleCookieName(roomName: string): string {
  return `better_space_role_${roomName.toLowerCase().trim()}`
}

function encryptionKey() {
  const secret = process.env.LIVEKIT_API_SECRET
  if (!secret) throw new Error("LIVEKIT_API_SECRET is required")
  return createHash("sha256").update(secret).digest()
}

function encryptValue(value: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv)
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ])
  return [iv, cipher.getAuthTag(), encrypted]
    .map((part) => part.toString("base64url"))
    .join(".")
}

function decryptValue(value: unknown): string {
  if (typeof value !== "string") return ""
  try {
    const [ivText, tagText, encryptedText] = value.split(".")
    if (!ivText || !tagText || !encryptedText) return ""
    const decipher = createDecipheriv(
      "aes-256-gcm",
      encryptionKey(),
      Buffer.from(ivText, "base64url")
    )
    decipher.setAuthTag(Buffer.from(tagText, "base64url"))
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedText, "base64url")),
      decipher.final(),
    ])
    return decrypted.toString("utf8")
  } catch {
    return ""
  }
}

function secretsEqual(expected: string, supplied: string): boolean {
  if (!expected || !supplied) return false
  const expectedBuffer = Buffer.from(expected)
  const suppliedBuffer = Buffer.from(supplied)
  if (expectedBuffer.length !== suppliedBuffer.length) return false
  return timingSafeEqual(expectedBuffer, suppliedBuffer)
}

export function encryptSpaceSecret(secret: string): string {
  return encryptValue(secret)
}

export function decryptSpaceSecret(value: unknown): string {
  return decryptValue(value)
}

export function hasHostAccess(
  meta: HostMetadata,
  identity: string,
  secret: string
): boolean {
  if (meta.host !== identity || !secret) return false

  const encryptedSecret = decryptSpaceSecret(meta.hostSecretEncrypted)
  if (encryptedSecret) return secretsEqual(encryptedSecret, secret)

  // Backwards compatibility for rooms created before encrypted host secrets.
  return typeof meta.hostSecret === "string" && secretsEqual(meta.hostSecret, secret)
}

export function encryptCohostSecrets(secrets: Record<string, string>): string {
  return encryptValue(JSON.stringify(secrets))
}

export function decryptCohostSecrets(value: unknown): Record<string, string> {
  try {
    const decrypted = decryptValue(value)
    if (!decrypted) return {}
    const secrets = JSON.parse(decrypted)
    return secrets && typeof secrets === "object" ? secrets : {}
  } catch {
    return {}
  }
}

export function hasCohostAccess(
  meta: CohostMetadata,
  identity: string,
  secret: string
): boolean {
  if (!Array.isArray(meta.cohosts) || !meta.cohosts.includes(identity)) {
    return false
  }

  const expectedSecret = decryptCohostSecrets(meta.cohostSecretsEncrypted)[
    identity
  ]
  return secretsEqual(expectedSecret, secret)
}
