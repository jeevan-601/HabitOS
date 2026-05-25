# HabitOS Backend

Lightweight Express + Socket.IO backend scaffold.

Setup

1. Copy `.env.example` → `.env` if you want Postgres; otherwise the server falls back to local SQLite for development.
2. Install dependencies: `npm install` inside the `server/` folder.
3. Start dev server: `npm run dev`.

Notes
- The DB auto-creates minimal tables on startup. For production, set `DATABASE_URL` and `JWT_SECRET` and use proper migrations.
- Socket.IO allows device-sync per user via rooms named `user:<id>`; clients should connect with `?token=JWT`.
