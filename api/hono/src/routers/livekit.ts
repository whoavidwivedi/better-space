import { env } from "@packages/env/api-hono"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { AccessToken, RoomServiceClient } from "livekit-server-sdk"
import { z } from "zod"

import { jsonError } from "@/lib/error"

const getRoomService = () => {
  const apiKey = env.LIVEKIT_API_KEY
  const apiSecret = env.LIVEKIT_API_SECRET
  const wsUrl = env.NEXT_PUBLIC_LIVEKIT_URL

  if (!apiKey || !apiSecret || !wsUrl) {
    throw new Error("LiveKit credentials missing")
  }
  return new RoomServiceClient(wsUrl, apiKey, apiSecret)
}

export const livekitRouter = new Hono()
  .get(
    "/token",
    describeRoute({
      tags: ["LiveKit"],
      description: "Get a LiveKit token to join a room",
      responses: {
        200: {
          description: "Successful response",
          content: {
            "application/json": {
              schema: resolver(z.object({ data: z.object({ token: z.string() }) })),
            },
          },
        },
      },
    }),
    async (c) => {
      const room = c.req.query("room")
      const usernameQuery = c.req.query("username")
      const hostSecretQuery = c.req.query("hostSecret")

      if (!room || !usernameQuery) {
        return jsonError(c, 400, "BAD_REQUEST", "Missing room or username")
      }

      const username = usernameQuery.trim().substring(0, 30)
      const cleanRoom = room.trim().substring(0, 30)
      const hostSecret = hostSecretQuery?.trim() ?? ""

      if (!/^[a-zA-Z0-9_-]+$/.test(cleanRoom)) {
        return jsonError(c, 400, "BAD_REQUEST", "Invalid room name")
      }

      let isHost = false
      let roomService: RoomServiceClient
      try {
        roomService = getRoomService()
      } catch (e: any) {
        return jsonError(c, 500, "INTERNAL_SERVER_ERROR", e.message)
      }

      const getRoomMeta = async () => {
        for (let i = 0; i < 3; i++) {
          try {
            const rooms = await roomService.listRooms([cleanRoom])
            if (rooms.length > 0) return rooms[0]
          } catch {}
          await new Promise((r) => setTimeout(r, 500))
        }
        return null
      }

      const targetRoom = await getRoomMeta()

      if (targetRoom && targetRoom.metadata) {
        try {
          const meta = JSON.parse(targetRoom.metadata)
          if (meta.banned && meta.banned.includes(username)) {
            return jsonError(c, 403, "FORBIDDEN", "You have been kicked from this space")
          }
          if (meta.host === username) {
            if (meta.hostSecret && hostSecret === meta.hostSecret) {
              isHost = true
            }
          }
        } catch {}
      }

      const at = new AccessToken(env.LIVEKIT_API_KEY!, env.LIVEKIT_API_SECRET!, {
        identity: username,
      })
      at.addGrant({
        room: cleanRoom,
        roomJoin: true,
        canPublish: isHost,
        canSubscribe: true,
        canPublishData: true,
        canUpdateOwnMetadata: true,
      })

      const token = await at.toJwt()
      return c.json({ data: { token } })
    },
  )
  .get(
    "/rooms",
    describeRoute({
      tags: ["LiveKit"],
      description: "List active rooms",
      responses: {
        200: {
          description: "Successful response",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  data: z.array(
                    z.object({
                      name: z.string(),
                      numParticipants: z.number(),
                      host: z.string(),
                      participants: z.array(z.string()),
                    }),
                  ),
                }),
              ),
            },
          },
        },
      },
    }),
    async (c) => {
      let roomService: RoomServiceClient
      try {
        roomService = getRoomService()
      } catch (e: any) {
        return jsonError(c, 500, "INTERNAL_SERVER_ERROR", e.message)
      }

      const rooms = await roomService.listRooms()
      const roomDetails = await Promise.all(
        rooms.map(async (r) => {
          let participants: any[] = []
          try {
            participants = await roomService.listParticipants(r.name)
          } catch {}

          let host = "Unknown"
          try {
            if (r.metadata) {
              const meta = JSON.parse(r.metadata)
              if (meta.host) host = meta.host
            }
          } catch {}

          if (host === "Unknown" && participants.length > 0) {
            host = participants[0].identity
          }

          return {
            name: r.name,
            numParticipants: r.numParticipants,
            host,
            participants: participants.map((p) => p.identity).slice(0, 3),
          }
        }),
      )

      return c.json({ data: roomDetails })
    },
  )
  .post(
    "/rooms",
    describeRoute({
      tags: ["LiveKit"],
      description: "Create a room",
      responses: {
        200: {
          description: "Successful response",
          content: {
            "application/json": {
              schema: resolver(
                z.object({ data: z.object({ roomName: z.string(), token: z.string() }) }),
              ),
            },
          },
        },
      },
    }),
    async (c) => {
      const body = await c.req.json()
      const { roomName, hostName } = body

      if (!roomName || !hostName) {
        return jsonError(c, 400, "BAD_REQUEST", "Missing roomName or hostName")
      }

      const cleanRoom = roomName.trim().substring(0, 30)
      const cleanHost = hostName.trim().substring(0, 30)

      let roomService: RoomServiceClient
      try {
        roomService = getRoomService()
      } catch (e: any) {
        return jsonError(c, 500, "INTERNAL_SERVER_ERROR", e.message)
      }

      const hostSecret = crypto.randomUUID()

      await roomService.createRoom({
        name: cleanRoom,
        emptyTimeout: 300,
        metadata: JSON.stringify({ host: cleanHost, hostSecret, banned: [] }),
      })

      const at = new AccessToken(env.LIVEKIT_API_KEY!, env.LIVEKIT_API_SECRET!, {
        identity: cleanHost,
      })
      at.addGrant({
        room: cleanRoom,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
        canUpdateOwnMetadata: true,
      })

      const token = await at.toJwt()
      return c.json({ data: { roomName: cleanRoom, token, hostSecret } })
    },
  )
  .post(
    "/moderate",
    describeRoute({
      tags: ["LiveKit"],
      description: "Moderate a room",
      responses: {
        200: {
          description: "Successful response",
          content: {
            "application/json": {
              schema: resolver(z.object({ data: z.object({ success: z.boolean() }) })),
            },
          },
        },
      },
    }),
    async (c) => {
      const body = await c.req.json()
      const { roomName, hostName, targetIdentity, action, hostSecret } = body

      if (!roomName || !hostName || !action || !hostSecret) {
        return jsonError(c, 400, "BAD_REQUEST", "Missing parameters")
      }

      let roomService: RoomServiceClient
      try {
        roomService = getRoomService()
      } catch (e: any) {
        return jsonError(c, 500, "INTERNAL_SERVER_ERROR", e.message)
      }

      let isHost = false
      let targetRoom: any = null
      try {
        const rooms = await roomService.listRooms()
        targetRoom = rooms.find((r) => r.name === roomName)
        if (targetRoom && targetRoom.metadata) {
          const meta = JSON.parse(targetRoom.metadata)
          if (meta.host === hostName && meta.hostSecret && meta.hostSecret === hostSecret) {
            isHost = true
          }
        }
      } catch {}

      if (!isHost) {
        return jsonError(c, 403, "FORBIDDEN", "Only the host can perform this action")
      }

      switch (action) {
        case "end":
          await roomService.deleteRoom(roomName)
          return c.json({ data: { success: true } })
        case "kick":
          if (!targetIdentity) return jsonError(c, 400, "BAD_REQUEST", "Missing targetIdentity")
          if (targetRoom && targetRoom.metadata) {
            try {
              const meta = JSON.parse(targetRoom.metadata)
              const banned = meta.banned || []
              if (!banned.includes(targetIdentity)) {
                banned.push(targetIdentity)
                meta.banned = banned
                await roomService.updateRoomMetadata(roomName, JSON.stringify(meta))
              }
            } catch {}
          }
          await roomService.removeParticipant(roomName, targetIdentity)
          return c.json({ data: { success: true } })
        case "grant_mic":
          if (!targetIdentity) return jsonError(c, 400, "BAD_REQUEST", "Missing targetIdentity")
          await roomService.updateParticipant(roomName, targetIdentity, {
            permission: { canPublish: true, canSubscribe: true, canPublishData: true },
          })
          return c.json({ data: { success: true } })
        case "revoke_mic":
          if (!targetIdentity) return jsonError(c, 400, "BAD_REQUEST", "Missing targetIdentity")
          await roomService.updateParticipant(roomName, targetIdentity, {
            permission: { canPublish: false, canSubscribe: true, canPublishData: true },
          })
          return c.json({ data: { success: true } })
        case "mute":
          if (!targetIdentity) return jsonError(c, 400, "BAD_REQUEST", "Missing targetIdentity")
          const participant = await roomService.getParticipant(roomName, targetIdentity)
          for (const track of participant.tracks) {
            if (track.source === 2) {
              await roomService.mutePublishedTrack(roomName, targetIdentity, track.sid, true)
            }
          }
          return c.json({ data: { success: true } })
        default:
          return jsonError(c, 400, "BAD_REQUEST", "Invalid action")
      }
    },
  )
