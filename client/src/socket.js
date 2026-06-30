import { io } from "socket.io-client";

// VITE_SERVER_URL is set for local dev (http://localhost:1337).
// In production (single service) leave it unset — socket.io connects to same origin.
const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? "";

export const socket = io(SERVER_URL, { autoConnect: false });
