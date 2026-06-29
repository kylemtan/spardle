import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Home({ socket, username, setUsername, setRoom, setUsers }) {
  const navigate = useNavigate();
  const [privateRoom, setPrivateRoom] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const onReturnRoom = (roomName) => setRoom(roomName);
    const onUpdateUsers = (data) => {
      setUsers(data);
      navigate("/lobby");
    };
    const onAlreadyStarted = () => setError("That game has already started.");

    socket.on("return roomname", onReturnRoom);
    socket.on("update users", onUpdateUsers);
    socket.on("already started", onAlreadyStarted);
    return () => {
      socket.off("return roomname", onReturnRoom);
      socket.off("update users", onUpdateUsers);
      socket.off("already started", onAlreadyStarted);
    };
  }, [socket, navigate, setRoom, setUsers]);

  function joinPublic() {
    setError("");
    socket.emit("joinPublic", username.trim());
  }

  function joinPrivate() {
    setError("");
    if (!privateRoom.trim()) { setError("Enter a room name."); return; }
    const roomName = privateRoom.trim().toLowerCase();
    setRoom(roomName);
    socket.emit("join", { username: username.trim() || "Guest", room: roomName });
  }

  return (
    <main className="page" style={{ justifyContent: "center" }}>
      <header className="home-header">
        <div className="logo"><span>S</span>pardle!</div>
        <p className="home-tagline">Multiplayer Wordle&nbsp;&nbsp;·&nbsp;&nbsp;First to 5 wins</p>
      </header>

      <div className="home-username-wrap">
        <input
          className="input"
          placeholder="Your name (optional)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={20}
          style={{ textAlign: "center" }}
        />
      </div>

      <div className="home-panels">
        {/* Quick Play */}
        <div className="card home-panel">
          <p className="home-panel-title">Quick Play</p>
          <p className="home-panel-desc">Jump into a public lobby and play with anyone online.</p>
          <button className="btn btn-primary" onClick={joinPublic}>Play Now</button>
        </div>

        {/* Private Room */}
        <div className="card home-panel">
          <p className="home-panel-title">Private Room</p>
          <input
            className="input"
            placeholder="Room name"
            value={privateRoom}
            onChange={(e) => setPrivateRoom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && joinPrivate()}
            maxLength={30}
          />
          <button className="btn btn-ghost" onClick={joinPrivate}>Join Room</button>
        </div>
      </div>

      {error && <p style={{ marginTop: 16, color: "#f87171", fontSize: "0.85rem" }}>{error}</p>}

      <footer className="home-footer">
        <Link to="/rules">Rules</Link>
        <Link to="/about">About</Link>
      </footer>
    </main>
  );
}
