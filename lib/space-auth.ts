import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto"

type CohostMetadata = {
  cohosts?: unknown
  cohostSecretsEncrypted?: unknown
}

export function roleCookieName(roomName: string): string {
  return `better_space_role_${roomName.toLowerCase().trim()}`
}

function encryptionKey() {
  const secret = process.env.LIVEKIT_API_SECRET
  if (!secret) throw new Error("LIVEKIT_API_SECRET is required")
  return createHash("sha256").update(secret).digest()
}

export function encryptCohostSecrets(secrets: Record<string, string>): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv)
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(secrets), "utf8"),
    cipher.final(),
  ])
  return [iv, cipher.getAuthTag(), encrypted]
    .map((part) => part.toString("base64url"))
    .join(".")
}

export function decryptCohostSecrets(value: unknown): Record<string, string> {
  if (typeof value !== "string") return {}
  try {
    const [ivText, tagText, encryptedText] = value.split(".")
    if (!ivText || !tagText || !encryptedText) return {}
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
    const secrets = JSON.parse(decrypted.toString("utf8"))
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
  return Boolean(expectedSecret && secret && expectedSecret === secret)
}
