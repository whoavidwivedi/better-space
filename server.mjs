import { createServer } from "node:http";
import next from "next";
import { Server as SocketIOServer } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = Number(process.env.PORT || 3000);
const globalRoomId = "global-main-room";

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

await app.prepare();

const httpServer = createServer((request, response) => handle(request, response));
const io = new SocketIOServer(httpServer, {
  cors: { origin: true, credentials: true },
  connectionStateRecovery: { maxDisconnectionDuration: 10_000 },
});

// This is intentionally one named room, not a host-owned room. The room is a
// stable namespace even when its member set is empty.
const members = new Map();

const roomMembers = () => [...members.values()].map(({ socket, ...member }) => member);

io.on("connection", (socket) => {
  let memberId;

  socket.on("room:join", (member) => {
    if (!member || typeof member.id !== "string" || typeof member.peerId !== "string" || typeof member.name !== "string") return;

    memberId = member.id;
    const previous = members.get(memberId);
    if (previous && previous.socket.id !== socket.id) {
      previous.socket.removeAllListeners("disconnect");
      previous.socket.disconnect(true);
      members.delete(memberId);
    }

    const nextMember = { id: member.id, peerId: member.peerId, name: member.name, socket };
    members.set(memberId, nextMember);
    socket.join(globalRoomId);
    socket.emit("room:state", { roomId: globalRoomId, members: roomMembers() });

    if (previous) {
      socket.to(globalRoomId).emit("room:member-reconnected", { previousPeerId: previous.peerId, member: { ...nextMember, socket: undefined } });
    } else {
      socket.to(globalRoomId).emit("room:member-joined", { member: { ...nextMember, socket: undefined } });
    }
  });

  socket.on("room:update", (message) => {
    if (!memberId || !members.has(memberId) || !message || typeof message.type !== "string") return;
    socket.to(globalRoomId).emit("room:update", message);
  });

  socket.on("room:leave", () => {
    if (!memberId) return;
    const current = members.get(memberId);
    if (current?.socket.id === socket.id) {
      members.delete(memberId);
      socket.to(globalRoomId).emit("room:member-left", { memberId, peerId: current.peerId });
    }
    socket.leave(globalRoomId);
  });

  socket.on("disconnect", () => {
    const current = memberId && members.get(memberId);
    if (current?.socket.id !== socket.id) return;
    members.delete(memberId);
    socket.to(globalRoomId).emit("room:member-left", { memberId, peerId: current.peerId });
  });
});

httpServer.listen(port, hostname, () => {
  console.log(`> Space is ready on http://${hostname}:${port}`);
});
