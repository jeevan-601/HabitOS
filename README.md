# HabitOS — Frontend Scaffold

This repository was reset and scaffolded with a Vite + React + Tailwind frontend.

Architecture
- Frontend: Vite + React + Tailwind at the repo root
- Backend: Express + Socket.IO in `server/`
- Data: Postgres via `DATABASE_URL`
- Auth: email/password with JWT access + refresh tokens
- Realtime: Socket.IO user rooms for device sync

Quick start:

1. Install dependencies: `npm install`
2. Run dev server: `npm run dev`

Backend quick start:

1. `cd server`
2. `cp .env.example .env`
3. Set `DATABASE_URL` and `JWT_SECRET`
4. `npm install`
5. `npm run dev`

Render deployment:
- Use `render.yaml` at the repo root.
- Create a Render Postgres instance and wire its `DATABASE_URL` into the API service.

Features scaffolded:
- React 18 + Vite
- Tailwind CSS with violet accent (`#7C3AED`)
- Basic pages: Dashboard, Habits, Focus, Stats, Profile
- Zustand store and localStorage persistence hook
