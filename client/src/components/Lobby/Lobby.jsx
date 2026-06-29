import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Lobby({ socket, room, users, setUsers, setWords }) {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!room) { navigate("/"); return; }

    const onUpdateUsers = (data) => setUsers(data);
    const onNotEnough = () => setError("Need at least 2 players to start.");
    const onSendWords = (wordList) => {
      setWords(wordList);
      navigate("/game");
    };

    socket.on("update users", onUpdateUsers);
    socket.on("not enough players", onNotEnough);
    socket.on("send words", onSendWords);
    return () => {
      socket.off("update users", onUpdateUsers);
      socket.off("not enough players", onNotEnough);
      socket.off("send words", onSendWords);
    };
  }, [socket, room, navigate, setUsers, setWords]);

  function startGame() {
    setError("");
    socket.emit("start game", room);
  }

  function copyRoom() {
    navigator.clipboard.writeText(room).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  function leaveRoom() {
    socket.emit("leave", room);
    navigate("/");
  }

  return (
    <main className="page" style={{ justifyContent: "center" }}>
      <div className="logo" style={{ marginBottom: 8 }}><span>S</span>pardle!</div>

      <div className="lobby-wrap">
        <div className="lobby-room">
          <div>
            <div className="lobby-room-label">Room</div>
            <div className="lobby-room-name">{room}</div>
          </div>
          <button className={`copy-btn ${copied ? "copied" : ""}`} onClick={copyRoom}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <div className="lobby-players" style={{ width: "100%" }}>
          <div className="lobby-players-label">Players&nbsp;({users.length})</div>
          <div className="lobby-player-list">
            {users.map((u, i) => (
              <div key={i} className="lobby-player">{u.username}</div>
            ))}
          </div>
        </div>

        {error && <p className="lobby-error">{error}</p>}

        <div style={{ display: "flex", gap: 12, width: "100%" }}>
          <button className="btn btn-ghost" onClick={leaveRoom} style={{ flex: 1 }}>Leave</button>
          <button className="btn btn-primary" onClick={startGame} style={{ flex: 2 }}>Spardle!</button>
        </div>

        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", textAlign: "center" }}>
          First player to reach 5 points wins.&nbsp; Correct guess +1 · Failed word −1.
        </p>
      </div>
    </main>
  );
}
