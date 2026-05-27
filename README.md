# HabitOS

HabitOS is a responsive productivity web app for desktop and mobile. It includes local login/signup, habit tracking, focus sessions, tasks, insights, achievements, and settings.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Render deployment

Use this repo as a static site on Render.

- Build command: `npm ci && npm run build`
- Publish directory: `dist`

The app uses client-side state and localStorage, so no backend is required for the default experience.