# Habit AI - Django Habit Tracker

Habit AI is a Django-based habit tracking app with social features, challenges, leaderboard rankings, reminders, and analytics.

## Features

- Habit management
  - Create, edit, delete habits
  - Daily, weekly, and custom-day schedules
  - Habit reminders
- Daily tasks
  - Add, complete, and remove daily tasks
- Insights and analytics
  - Weekly and monthly progress charts
  - Habit activity calendar (3-month view)
  - AI-generated insight summary
- Social
  - Profiles with avatars and status
  - Follow users
  - Send kudos
  - Activity feed
- Competition
  - Leaderboard ranking by streak and completions
  - Group challenges with member participation
  - Suggested challenges based on user habits
- Notifications
  - In-app notification center

## Tech Stack

- Python
- Django 5.x
- SQLite (default local database)
- Bootstrap 5
- Chart.js

## Project Structure

- habit_ai/ : Django project settings and URL config
- habits/ : Core application logic, templates, models, services, and views
- manage.py : Django CLI entry point

## Local Setup

### 1) Clone repository

```bash
git clone https://github.com/Flame-Phoneix/habit_ai.git
cd habit_ai
```

### 2) Create and activate virtual environment

Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 3) Install dependencies

```bash
pip install -r requirements.txt
```

### 4) Apply migrations

```bash
python manage.py migrate
```

### 5) Run development server

```bash
python manage.py runserver
```

Open http://127.0.0.1:8000/

## Useful Commands

```bash
python manage.py check
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

## GitHub

Repository URL:

- https://github.com/Flame-Phoneix/habit_ai

## Deployment Notes

Before production deployment:

- Set DJANGO_DEBUG=False
- Set DJANGO_SECRET_KEY
- Configure DJANGO_ALLOWED_HOSTS
- Configure DJANGO_CSRF_TRUSTED_ORIGINS
- Use PostgreSQL instead of SQLite
- Configure static and media storage

## Deploy On Render

This project is prepared for Render with:

- `Procfile`
- `runtime.txt`
- `requirements.txt`
- environment-aware Django settings in [habit_ai/settings.py](habit_ai/settings.py)

### 1) Create services

1. Create a PostgreSQL service in Render.
2. Create a Web Service from this GitHub repo.

### 2) Web service config

- Build Command:

```bash
pip install -r requirements.txt && python manage.py collectstatic --noinput
```

- Start Command:

```bash
gunicorn habit_ai.wsgi:application
```

### 3) Required environment variables

- `DJANGO_SECRET_KEY` = long random secret
- `DJANGO_DEBUG` = `false`
- `DJANGO_ALLOWED_HOSTS` = `your-app.onrender.com`
- `DJANGO_CSRF_TRUSTED_ORIGINS` = `https://your-app.onrender.com`
- `DATABASE_URL` = value from Render PostgreSQL service

### 4) After first deploy

Run once in Render shell:

```bash
python manage.py migrate
python manage.py createsuperuser
```

## License

Add your preferred license in a LICENSE file.
