# Spardle

Real-time multiplayer Wordle. First to 5 points wins.

## Monorepo structure

```
spardle/
  client/     Vite + React 18 static site
  server/     Express + Socket.IO web service
```

## Local development

```bash
# Terminal 1 — server
cd server && npm install && npm run dev

# Terminal 2 — client
cd client && npm install && npm run dev
```

The client defaults to `http://localhost:1337` for the server.

## Render deployment

### Server (Web Service)
- Root directory: `server`
- Build command: `npm install`
- Start command: `node server.js`
- Environment variables:
  - `PORT` — set automatically by Render
  - `CLIENT_ORIGIN` — your Render Static Site URL (e.g. `https://spardle.onrender.com`)

### Client (Static Site)
- Root directory: `client`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Environment variables:
  - `VITE_SERVER_URL` — your Render Web Service URL (e.g. `https://spardle-server.onrender.com`)

## Game rules

- All players in a room receive the same 20 random words per game.
- Correct guess within 6 tries → **+1 point**
- Exhaust all guesses → **−1 point** (minimum 0)
- First to **5 points** wins, or highest score when the 7-minute timer expires.
