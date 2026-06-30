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
cd server && npm install && node server.js

# Terminal 2 — client (set server URL so the dev client finds the local server)
cd client && npm install && VITE_SERVER_URL=http://localhost:1337 npx vite
```

## Render deployment (single Web Service)

- Root directory: *(leave blank — repo root)*
- Build command: `npm run build`
- Start command: `npm start`
- Environment variables:
  - `PORT` — set automatically by Render
  - `NODE_ENV` — set to `production`

No other env vars needed. The client connects to the same origin in production.

## Game rules

- All players in a room receive the same 20 random words per game.
- Correct guess within 6 tries → **+1 point**
- Exhaust all guesses → **−1 point** (minimum 0)
- First to **5 points** wins, or highest score when the 7-minute timer expires.
