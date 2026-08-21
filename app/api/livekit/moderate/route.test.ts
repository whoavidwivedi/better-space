import { describe, expect, mock, test } from "bun:test"
import { NextRequest } from "next/server"
import {
  decryptCohostSecrets,
  encryptCohostSecrets,
  roleCookieName,
} from "@/lib/space-auth"

const roomName = "p1-flow"
const host = "host"
const cohost = "cohost"
const hostSecret = "host-secret"

let metadata = JSON.stringify({
  host,
  hostSecret,
  cohosts: [],
  banned: [],
})
let deleted = false
let tombstoneCreated = false
let sentCredentials = ""

class FakeRoomServiceClient {
  async listRooms() {
    return [{ metadata, numParticipants: 1 }]
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
    return [{ identity: host }, { identity: cohost }]
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
      return { sub: token, video: { room: roomName } }
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

    metadata = JSON.stringify({ host, hostSecret, cohosts: [], banned: [] })
    deleted = false
    tombstoneCreated = false
    sentCredentials = ""

    const grantResponse = await POST(
      request(host, hostSecret, "grant_cohost", cohost)
    )
    expect(grantResponse.status).toBe(200)
    expect(await grantResponse.json()).toEqual({ data: { success: true } })
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
      hostSecret,
      cohosts: [cohost],
      cohostSecretsEncrypted: encryptCohostSecrets({ [cohost]: cohostSecret }),
    })
    const revokeResponse = await POST(
      request(host, hostSecret, "revoke_cohost", cohost)
    )
    expect(revokeResponse.status).toBe(200)
    const revokedMeta = JSON.parse(metadata)
    expect(revokedMeta.cohosts).toEqual([])
    expect(decryptCohostSecrets(revokedMeta.cohostSecretsEncrypted)).toEqual({})
  })

  test("keeps cohost management host-only", async () => {
    metadata = JSON.stringify({
      host,
      hostSecret,
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
})
