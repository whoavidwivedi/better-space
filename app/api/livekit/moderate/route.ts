import { RoomServiceClient } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";

function getRoomService() {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    throw new Error("LiveKit credentials missing");
  }
  return new RoomServiceClient(wsUrl, apiKey, apiSecret);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { roomName, hostName, targetIdentity, action, hostSecret } = body;

  if (!roomName || !hostName || !action || !hostSecret) {
    return NextResponse.json({ error: { message: "Missing parameters" } }, { status: 400 });
  }

  let roomService: RoomServiceClient;
  try {
    roomService = getRoomService();
  } catch (e: any) {
    return NextResponse.json({ error: { message: e.message } }, { status: 500 });
  }

  let isHost = false;
  let targetRoom: any = null;
  try {
    const rooms = await roomService.listRooms();
    targetRoom = rooms.find((r) => r.name === roomName);
    if (targetRoom && targetRoom.metadata) {
      const meta = JSON.parse(targetRoom.metadata);
      if (meta.host === hostName && meta.hostSecret && meta.hostSecret === hostSecret) {
        isHost = true;
      }
    }
  } catch {}

  if (!isHost) {
    return NextResponse.json(
      { error: { message: "Only the host can perform this action" } },
      { status: 403 },
    );
  }

  switch (action) {
    case "end":
      await roomService.deleteRoom(roomName);
      return NextResponse.json({ data: { success: true } });
    case "kick":
      if (!targetIdentity) {
        return NextResponse.json({ error: { message: "Missing targetIdentity" } }, { status: 400 });
      }
      if (targetRoom && targetRoom.metadata) {
        try {
          const meta = JSON.parse(targetRoom.metadata);
          const banned = meta.banned || [];
          if (!banned.includes(targetIdentity)) {
            banned.push(targetIdentity);
            meta.banned = banned;
            await roomService.updateRoomMetadata(roomName, JSON.stringify(meta));
          }
        } catch {}
      }
      await roomService.removeParticipant(roomName, targetIdentity);
      return NextResponse.json({ data: { success: true } });
    case "grant_mic":
      if (!targetIdentity) {
        return NextResponse.json({ error: { message: "Missing targetIdentity" } }, { status: 400 });
      }
      await roomService.updateParticipant(roomName, targetIdentity, {
        permission: { canPublish: true, canSubscribe: true, canPublishData: true },
      });
      return NextResponse.json({ data: { success: true } });
    case "revoke_mic":
      if (!targetIdentity) {
        return NextResponse.json({ error: { message: "Missing targetIdentity" } }, { status: 400 });
      }
      await roomService.updateParticipant(roomName, targetIdentity, {
        permission: { canPublish: false, canSubscribe: true, canPublishData: true },
      });
      return NextResponse.json({ data: { success: true } });
    case "mute":
      if (!targetIdentity) {
        return NextResponse.json({ error: { message: "Missing targetIdentity" } }, { status: 400 });
      }
      const participant = await roomService.getParticipant(roomName, targetIdentity);
      for (const track of participant.tracks) {
        if (track.source === 2) {
          await roomService.mutePublishedTrack(roomName, targetIdentity, track.sid, true);
        }
      }
      return NextResponse.json({ data: { success: true } });
    default:
      return NextResponse.json({ error: { message: "Invalid action" } }, { status: 400 });
  }
}
