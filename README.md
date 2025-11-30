# Taya

This repository contains the **Tako Tasks** Slack app system. Project files live in `tako-tasks/` with FastAPI backend, Next.js
frontend, and Docker configuration.

## Project layout

- `tako-tasks/backend`: FastAPI service that powers the Slack app APIs
- `tako-tasks/frontend`: Next.js dashboard and onboarding flows
- `tako-tasks/docker-compose.yml`: Local orchestration for the API, dashboard, and PostgreSQL

## Quick start (Docker)

1. Create a `.env` file inside `tako-tasks/` using the sample below.
2. From `tako-tasks/`, run `docker-compose up --build`.
3. Access the API at <http://localhost:8000> and the dashboard at <http://localhost:3000>.

## Run services manually

### Backend

```bash
cd tako-tasks/backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# Ensure the environment variables below are exported
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd tako-tasks/frontend
npm install
# Ensure NEXT_PUBLIC_API_URL is set (see below)
npm run dev
```

## Environment configuration

Create `tako-tasks/.env` (used by Docker) or export these variables in your shell when running the services manually:

```env
# Backend
DATABASE_URL=postgresql+psycopg2://postgres:postgres@db:5432/tako_tasks
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
SLACK_SIGNING_SECRET=your_slack_signing_secret
APP_BASE_URL=http://localhost:8000
JWT_SECRET=super-secret
JWT_EXPIRES_MINUTES=60
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@tako-tasks.com

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Adjust hostnames/ports as needed if you are not using Docker defaults.
