const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const cors = require("cors");
const words = require("./data/words");

const PORT = process.env.PORT || 1337;
const DEV_ORIGIN = process.env.DEV_ORIGIN || "http://localhost:5173";
const CLIENT_BUILD = path.resolve(__dirname, "..", "client", "dist");

const app = express();
// Allow the Vite dev server origin in development; in production same-origin so no CORS needed
app.use(cors({ origin: DEV_ORIGIN }));
app.use(express.static(CLIENT_BUILD));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: DEV_ORIGIN, methods: ["GET", "POST"] },
});

// rooms[roomName] = { users: [{id, username, score}], active: bool, words: [] }
const rooms = {};
// socketId -> roomName
const socketRoom = {};

function pickWords(n = 20) {
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n).map((w) => ({ word: w }));
}

function safeUsers(roomName) {
  return (rooms[roomName]?.users ?? []).map(({ username, score }) => ({
    username,
    score,
  }));
}

function removeFromRoom(socketId) {
  const roomName = socketRoom[socketId];
  if (!roomName || !rooms[roomName]) return;
  rooms[roomName].users = rooms[roomName].users.filter(
    (u) => u.id !== socketId
  );
  delete socketRoom[socketId];
  if (rooms[roomName].users.length === 0) {
    delete rooms[roomName];
  }
  return roomName;
}

io.on("connection", (socket) => {
  // ── Private room ──────────────────────────────────────────────────────────
  socket.on("join", ({ username, room }) => {
    const roomName = room.toLowerCase();
    if (rooms[roomName]?.active) {
      socket.emit("already started");
      return;
    }
    if (!rooms[roomName]) {
      rooms[roomName] = { users: [], active: false, words: [] };
    }
    // Prevent duplicate socket entries
    if (!rooms[roomName].users.find((u) => u.id === socket.id)) {
      rooms[roomName].users.push({ id: socket.id, username, score: 0 });
    }
    socketRoom[socket.id] = roomName;
    socket.join(roomName);
    io.in(roomName).emit("update users", safeUsers(roomName));
  });

  // ── Public matchmaking ────────────────────────────────────────────────────
  socket.on("joinPublic", (username) => {
    const name = username?.trim() || "Guest";
    // Find the lowest-numbered public room that isn't active yet
    let n = 1;
    while (rooms[`public${n}`]?.active) n++;
    const roomName = `public${n}`;

    if (!rooms[roomName]) {
      rooms[roomName] = { users: [], active: false, words: [] };
    }
    if (!rooms[roomName].users.find((u) => u.id === socket.id)) {
      rooms[roomName].users.push({ id: socket.id, username: name, score: 0 });
    }
    socketRoom[socket.id] = roomName;
    socket.join(roomName);
    io.in(roomName).emit("return roomname", roomName);
    io.in(roomName).emit("update users", safeUsers(roomName));
  });

  // ── Start game ────────────────────────────────────────────────────────────
  socket.on("start game", (roomName) => {
    if (!rooms[roomName]) return;
    if (rooms[roomName].users.length < 2) {
      socket.emit("not enough players");
      return;
    }
    rooms[roomName].active = true;
    rooms[roomName].words = pickWords();
    io.in(roomName).emit("send words", rooms[roomName].words);
  });

  // ── Guess result ─────────────────────────────────────────────────────────
  socket.on("game update", ({ room, correct }) => {
    if (!rooms[room]) return;
    const user = rooms[room].users.find((u) => u.id === socket.id);
    if (!user) return;

    if (correct) {
      user.score++;
      io.in(room).emit("banner", { username: user.username, correct: true });
    } else if (user.score > 0) {
      user.score--;
      io.in(room).emit("banner", { username: user.username, correct: false });
    }

    // Win condition
    if (user.score >= 5) {
      io.in(room).emit("end game", safeUsers(room));
      rooms[room].active = false;
      return;
    }

    io.in(room).emit("update game users", safeUsers(room));
  });

  // ── Timer expired (client-triggered) ─────────────────────────────────────
  socket.on("end game", (roomName) => {
    if (!rooms[roomName]) return;
    io.in(roomName).emit("end game", safeUsers(roomName));
    rooms[roomName].active = false;
  });

  // ── Leave room ───────────────────────────────────────────────────────────
  socket.on("leave", (roomName) => {
    socket.leave(roomName);
    removeFromRoom(socket.id);
    io.in(roomName).emit("update users", safeUsers(roomName));
  });

  // ── Disconnect ───────────────────────────────────────────────────────────
  socket.on("disconnect", () => {
    const roomName = removeFromRoom(socket.id);
    if (roomName) {
      const event = rooms[roomName]?.active ? "update game users" : "update users";
      io.in(roomName).emit(event, safeUsers(roomName));
    }
  });
});

// SPA fallback — serve index.html for all non-socket routes
app.get("*", (req, res) => {
  res.sendFile(path.join(CLIENT_BUILD, "index.html"));
});

server.listen(PORT, () => console.log(`Spardle server running on port ${PORT}`));
