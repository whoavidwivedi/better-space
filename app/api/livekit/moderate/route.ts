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

  const cleanRoom = roomName.trim().substring(0, 30);
  const cleanHost = hostName.trim().substring(0, 30);

  let roomService: RoomServiceClient;
  try {
    roomService = getRoomService();
  } catch (e: any) {
    return NextResponse.json({ error: { message: e.message } }, { status: 500 });
  }

  let isHost = false;
  let targetRoom: any = null;
  try {
    const rooms = await roomService.listRooms([cleanRoom]);
    targetRoom = rooms.length > 0 ? rooms[0] : null;
    if (targetRoom && targetRoom.metadata) {
      const meta = JSON.parse(targetRoom.metadata);
      if (meta.host === cleanHost && meta.hostSecret && meta.hostSecret === hostSecret) {
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
      await roomService.deleteRoom(cleanRoom);
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
            await roomService.updateRoomMetadata(cleanRoom, JSON.stringify(meta));
          }
        } catch {}
      }
      try {
        await roomService.removeParticipant(cleanRoom, targetIdentity);
      } catch (e: any) {
        return NextResponse.json({ error: { message: e.message } }, { status: 500 });
      }
      return NextResponse.json({ data: { success: true } });
    case "grant_mic":
      if (!targetIdentity) {
        return NextResponse.json({ error: { message: "Missing targetIdentity" } }, { status: 400 });
      }
      try {
        const participant = await roomService.getParticipant(cleanRoom, targetIdentity);
        await roomService.updateParticipant(cleanRoom, targetIdentity, {
          metadata: participant.metadata,
          permission: { 
            canPublish: true, 
            canSubscribe: participant.permission?.canSubscribe ?? true, 
            canPublishData: participant.permission?.canPublishData ?? true,
            canUpdateOwnMetadata: participant.permission?.canUpdateOwnMetadata ?? false,
            hidden: participant.permission?.hidden ?? false,
            recorder: participant.permission?.recorder ?? false,
          },
        });
      } catch (e: any) {
        return NextResponse.json({ error: { message: e.message } }, { status: 500 });
      }
      return NextResponse.json({ data: { success: true } });
    case "revoke_mic":
      if (!targetIdentity) {
        return NextResponse.json({ error: { message: "Missing targetIdentity" } }, { status: 400 });
      }
      try {
        const participant = await roomService.getParticipant(cleanRoom, targetIdentity);
        await roomService.updateParticipant(cleanRoom, targetIdentity, {
          metadata: participant.metadata,
          permission: { 
            canPublish: false, 
            canSubscribe: participant.permission?.canSubscribe ?? true, 
            canPublishData: participant.permission?.canPublishData ?? true,
            canUpdateOwnMetadata: participant.permission?.canUpdateOwnMetadata ?? false,
            hidden: participant.permission?.hidden ?? false,
            recorder: participant.permission?.recorder ?? false,
          },
        });
      } catch (e: any) {
        return NextResponse.json({ error: { message: e.message } }, { status: 500 });
      }
      return NextResponse.json({ data: { success: true } });
    case "mute":
      if (!targetIdentity) {
        return NextResponse.json({ error: { message: "Missing targetIdentity" } }, { status: 400 });
      }
      try {
        const participant = await roomService.getParticipant(cleanRoom, targetIdentity);
        for (const track of participant.tracks) {
          if (track.source === 2) {
            await roomService.mutePublishedTrack(cleanRoom, targetIdentity, track.sid, true);
          }
        }
      } catch (e: any) {
        return NextResponse.json({ error: { message: e.message } }, { status: 500 });
      }
      return NextResponse.json({ data: { success: true } });
    default:
      return NextResponse.json({ error: { message: "Invalid action" } }, { status: 400 });
  }
}
