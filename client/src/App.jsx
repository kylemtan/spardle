import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { socket } from "./socket";
import Home from "./components/Home/Home";
import Lobby from "./components/Lobby/Lobby";
import Game from "./components/Game/Game";
import End from "./components/End/End";
import Rules from "./components/Rules/Rules";
import About from "./components/About/About";

export default function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [users, setUsers] = useState([]);
  const [words, setWords] = useState([]);
  const [finalWord, setFinalWord] = useState("");

  useEffect(() => {
    socket.connect();
    return () => { socket.disconnect(); };
  }, []);

  const sharedProps = { socket, username, setUsername, room, setRoom, users, setUsers, words, setWords, finalWord, setFinalWord };

  return (
    <Routes>
      <Route path="/" element={<Home {...sharedProps} />} />
      <Route path="/lobby" element={<Lobby {...sharedProps} />} />
      <Route path="/game" element={<Game {...sharedProps} />} />
      <Route path="/end" element={<End {...sharedProps} />} />
      <Route path="/rules" element={<Rules />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
