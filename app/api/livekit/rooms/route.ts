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

export async function GET() {
  let roomService: RoomServiceClient;
  try {
    roomService = getRoomService();
  } catch (e: any) {
    return NextResponse.json({ error: { message: e.message } }, { status: 500 });
  }

  const rooms = await roomService.listRooms();
  const roomDetails = await Promise.all(
    rooms.map(async (r) => {
      let participants: any[] = [];
      try {
        participants = await roomService.listParticipants(r.name);
      } catch {}

      let host = "Unknown";
      try {
        if (r.metadata) {
          const meta = JSON.parse(r.metadata);
          if (meta.host) host = meta.host;
        }
      } catch {}

      if (host === "Unknown" && participants.length > 0) {
        host = participants[0].identity;
      }

      return {
        name: r.name,
        numParticipants: r.numParticipants,
        host,
        participants: participants.map((p) => p.identity).slice(0, 3),
      };
    }),
  );

  return NextResponse.json({ data: roomDetails });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { roomName, hostName } = body;

  if (!roomName || !hostName) {
    return NextResponse.json(
      { error: { message: "Missing roomName or hostName" } },
      { status: 400 },
    );
  }

  const cleanRoom = roomName.trim().substring(0, 30);
  const cleanHost = hostName.trim().substring(0, 30);

  let roomService: RoomServiceClient;
  try {
    roomService = getRoomService();
  } catch (e: any) {
    return NextResponse.json({ error: { message: e.message } }, { status: 500 });
  }

  const hostSecret = crypto.randomUUID();

  try {
    const existingRooms = await roomService.listRooms([cleanRoom]);
    if (existingRooms.length > 0) {
      return NextResponse.json(
        { error: { message: "Space already exists. Please join it from the lobby instead." } },
        { status: 400 },
      );
    }
  } catch {}

  await roomService.createRoom({
    name: cleanRoom,
    emptyTimeout: 300,
    metadata: JSON.stringify({ host: cleanHost, hostSecret, banned: [] }),
  });

  const at = new AccessToken(process.env.LIVEKIT_API_KEY!, process.env.LIVEKIT_API_SECRET!, {
    identity: cleanHost,
  });
  at.addGrant({
    room: cleanRoom,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    canUpdateOwnMetadata: true,
  });

  const token = await at.toJwt();
  return NextResponse.json({ data: { roomName: cleanRoom, token, hostSecret } });
}
