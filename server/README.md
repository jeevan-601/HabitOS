# HabitOS Backend

Lightweight Express + Socket.IO backend scaffold.

Setup

1. Copy `.env.example` → `.env` and adjust `DATABASE_URL` and `JWT_SECRET`.
2. Install dependencies: `npm install` inside the `server/` folder.
3. Start dev server: `npm run dev` (requires Postgres reachable from `DATABASE_URL`).

Notes
- The DB auto-creates minimal tables on startup. For production, use proper migrations.
- Socket.IO allows device-sync per user via rooms named `user:<id>`; clients should connect with `?token=JWT`.
