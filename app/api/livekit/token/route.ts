import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
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

export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get("room");
  const usernameQuery = req.nextUrl.searchParams.get("username");
  const hostSecretQuery = req.nextUrl.searchParams.get("hostSecret");
  const avatarQuery = req.nextUrl.searchParams.get("avatar");

  if (!room || !usernameQuery) {
    return NextResponse.json(
      { error: { message: "Missing room or username" } },
      { status: 400 },
    );
  }

  const username = usernameQuery.trim().substring(0, 30);
  const cleanRoom = room.trim().substring(0, 30);
  const hostSecret = hostSecretQuery?.trim() ?? "";
  const avatar = avatarQuery?.trim() ?? "";

  if (!/^[a-zA-Z0-9_-]+$/.test(cleanRoom)) {
    return NextResponse.json({ error: { message: "Invalid room name" } }, { status: 400 });
  }

  let roomService: RoomServiceClient;
  try {
    roomService = getRoomService();
  } catch (e: any) {
    return NextResponse.json({ error: { message: e.message } }, { status: 500 });
  }

  const getRoomMeta = async () => {
    for (let i = 0; i < 3; i++) {
      try {
        const rooms = await roomService.listRooms([cleanRoom]);
        if (rooms.length > 0) return rooms[0];
      } catch {}
      await new Promise((r) => setTimeout(r, 500));
    }
    return null;
  };

  const targetRoom = await getRoomMeta();

  let isHost = false;
  if (targetRoom && targetRoom.metadata) {
    try {
      const meta = JSON.parse(targetRoom.metadata);
      if (meta.banned && meta.banned.includes(username)) {
        return NextResponse.json(
          { error: { message: "You have been kicked from this space" } },
          { status: 403 },
        );
      }
      if (meta.host === username) {
        if (meta.hostSecret && hostSecret === meta.hostSecret) {
          isHost = true;
        } else {
          // Security Fix: Prevent unauthorized users from claiming the host's identity
          return NextResponse.json(
            { error: { message: "Invalid host secret or username already taken by host" } },
            { status: 403 },
          );
        }
      }
    } catch {}
  } else if (hostSecret) {
    isHost = true;
    try {
      const meta = { host: username, hostSecret, banned: [] };
      await roomService.updateRoomMetadata(cleanRoom, JSON.stringify(meta));
    } catch {}
  }

  if (targetRoom && targetRoom.numParticipants >= 50 && !isHost) {
    return NextResponse.json(
      { error: { message: "This space is full (max 50 participants)." } },
      { status: 403 },
    );
  }

  const at = new AccessToken(process.env.LIVEKIT_API_KEY!, process.env.LIVEKIT_API_SECRET!, {
    identity: username,
    metadata: JSON.stringify({ avatar }),
  });
  at.addGrant({
    room: cleanRoom,
    roomJoin: true,
    canPublish: isHost,
    canSubscribe: true,
    canPublishData: true,
    canUpdateOwnMetadata: true,
  });

  const token = await at.toJwt();
  return NextResponse.json({ data: { token } });
}
