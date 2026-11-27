import { createHash } from "node:crypto"

const MARKER_PREFIX = "closed."

type RoomRecord = { name: string; sid: string; metadata: string }

export function closureMarkerName(roomName: string) {
  const key = createHash("sha256")
    .update(roomName.trim().toLowerCase())
    .digest("base64url")
  return MARKER_PREFIX + key
}

export function isClosureMarker(name: string) {
  return name.startsWith(MARKER_PREFIX)
}

export function readRoomClosure(
  rooms: RoomRecord[],
  roomName: string
): { roomSid: string; endedAt: number; host: string; closing: boolean } | null {
  const marker = rooms.find((room) => room.name === closureMarkerName(roomName))
  if (!marker) return null

  const data = JSON.parse(marker.metadata)
  if (
    typeof data.roomSid !== "string" ||
    typeof data.endedAt !== "number" ||
    typeof data.host !== "string"
  ) {
    throw new Error("Invalid room closure marker")
  }

  return {
    roomSid: data.roomSid,
    endedAt: data.endedAt,
    host: data.host,
    closing: rooms.some((room) => room.sid === data.roomSid),
  }
}
