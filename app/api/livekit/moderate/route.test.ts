import { describe, expect, mock, spyOn, test } from "bun:test"
import { NextRequest } from "next/server"
import {
  decryptCohostSecrets,
  encryptCohostSecrets,
  hashHostSecret,
  roleCookieName,
} from "@/lib/space-auth"

const roomName = "p1-flow"
const host = "host"
const cohost = "cohost"
const hostSecret = "host-secret"

// Set in the test, once LIVEKIT_API_SECRET (the hash key) is.
let metadata = ""
let deleted = false
let tombstoneCreated = false
let sentCredentials = ""
let cohostCanPublish = false
let participantIdentities = [host, cohost]

class FakeRoomServiceClient {
  async listRooms() {
    return [{ sid: "test-room-sid", metadata, numParticipants: 1 }]
  }

  async updateRoomMetadata(_room: string, nextMetadata: string) {
    metadata = nextMetadata
  }

  async sendData(
    _room: string,
    data: Uint8Array,
    _kind: unknown,
    _options: unknown
  ) {
    sentCredentials = new TextDecoder().decode(data)
  }

  async listParticipants() {
    return participantIdentities.map((identity) => ({ identity }))
  }

  async getParticipant(_room: string, identity: string) {
    return {
      identity,
      metadata: "{}",
      permission: {
        canPublish: identity === cohost ? cohostCanPublish : true,
        canSubscribe: true,
        canPublishData: true,
        canUpdateMetadata: false,
        hidden: false,
        recorder: false,
      },
    }
  }

  async updateParticipant(
    _room: string,
    identity: string,
    options: { permission?: { canPublish?: boolean } }
  ) {
    if (identity === cohost) {
      cohostCanPublish = options.permission?.canPublish ?? false
    }
  }

  async deleteRoom() {
    deleted = true
  }

  async createRoom() {
    tombstoneCreated = true
  }
}

mock.module("livekit-server-sdk", () => ({
  DataPacket_Kind: { RELIABLE: 0 },
  RoomServiceClient: FakeRoomServiceClient,
  TokenVerifier: class {
    async verify(token: string) {
      return { sub: token, video: { room: roomName, roomJoin: true } }
    }
  },
}))

mock.module("@/lib/ended-spaces", () => ({
  markSpaceEnded: () => undefined,
}))

const { POST } = await import("./route")

function request(
  identity: string,
  secret: string,
  action: string,
  targetIdentity?: string
) {
  return new NextRequest("http://localhost/api/livekit/moderate", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "http://localhost",
      cookie: `${roleCookieName(roomName)}=${secret}`,
    },
    body: JSON.stringify({
      roomName,
      targetIdentity,
      action,
      token: identity,
    }),
  })
}

describe("moderation room flow", () => {
  test("promotes, revokes, and ends through the API boundary", async () => {
    process.env.LIVEKIT_API_KEY = "test-key"
    process.env.LIVEKIT_API_SECRET = "test-secret"
    process.env.NEXT_PUBLIC_LIVEKIT_URL = "wss://test.livekit.invalid"

    metadata = JSON.stringify({
      host,
      hostSecretHash: hashHostSecret(hostSecret),
      cohosts: [],
      banned: [],
    })
    deleted = false
    tombstoneCreated = false
    sentCredentials = ""
    cohostCanPublish = false

    const grantResponse = await POST(
      request(host, hostSecret, "grant_cohost", cohost)
    )
    expect(grantResponse.status).toBe(200)
    expect(await grantResponse.json()).toEqual({ data: { success: true } })
    expect(cohostCanPublish).toBe(true)
    expect(sentCredentials).toContain('"type":"COHOST_CREDENTIALS"')
    expect(sentCredentials).toContain(`"identity":"${cohost}"`)
    expect(sentCredentials).toContain('"secret":"')

    const promotedMeta = JSON.parse(metadata)
    expect(promotedMeta.cohostSecrets).toBeUndefined()
    expect(promotedMeta.cohostSecretsEncrypted).toBeString()
    const cohostSecret = decryptCohostSecrets(
      promotedMeta.cohostSecretsEncrypted
    )[cohost]
    expect(cohostSecret).toBeString()

    const endResponse = await POST(request(cohost, cohostSecret, "end"))
    expect(endResponse.status).toBe(200)
    expect(deleted).toBe(true)
    expect(tombstoneCreated).toBe(true)

    metadata = JSON.stringify({
      host,
      hostSecretHash: hashHostSecret(hostSecret),
      cohosts: [cohost],
      cohostSecretsEncrypted: encryptCohostSecrets({ [cohost]: cohostSecret }),
    })
    const revokeResponse = await POST(
      request(host, hostSecret, "revoke_cohost", cohost)
    )
    expect(revokeResponse.status).toBe(200)
    expect(cohostCanPublish).toBe(false)
    const revokedMeta = JSON.parse(metadata)
    expect(revokedMeta.cohosts).toEqual([])
    expect(decryptCohostSecrets(revokedMeta.cohostSecretsEncrypted)).toEqual({})

    const revokedActionResponse = await POST(
      request(cohost, cohostSecret, "end")
    )
    expect(revokedActionResponse.status).toBe(403)
  })

  test("keeps cohost management host-only", async () => {
    metadata = JSON.stringify({
      host,
      hostSecretHash: hashHostSecret(hostSecret),
      cohosts: [cohost],
      cohostSecretsEncrypted: encryptCohostSecrets({
        [cohost]: "cohost-secret",
      }),
    })

    const response = await POST(
      request(cohost, "cohost-secret", "grant_cohost", "another-user")
    )
    expect(response.status).toBe(403)
  })

  test("requires a connected listener and keeps hosted rooms open", async () => {
    metadata = JSON.stringify({ host, cohosts: [cohost] })
    deleted = false
    const hosted = await POST(request(cohost, "", "end_if_unhosted"))
    expect(hosted.status).toBe(409)
    expect(deleted).toBe(false)

    participantIdentities = ["listener"]
    try {
      const disconnected = await POST(request("absent", "", "end_if_unhosted"))
      expect(disconnected.status).toBe(409)
      expect(deleted).toBe(false)
    } finally {
      participantIdentities = [host, cohost]
    }
  })

  test("rechecks presence before closing an abandoned room", async () => {
    metadata = JSON.stringify({ host, cohosts: [] })
    participantIdentities = ["listener"]
    deleted = false
    tombstoneCreated = false
    const clock = spyOn(performance, "now")
      .mockReturnValueOnce(0)
      .mockReturnValue(60_000)
    try {
      const response = await POST(request("listener", "", "end_if_unhosted"))
      expect(response.status).toBe(200)
      expect(deleted).toBe(true)
      expect(tombstoneCreated).toBe(true)
    } finally {
      clock.mockRestore()
      participantIdentities = [host, cohost]
    }
  }, 10_000)
})
