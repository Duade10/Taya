# Tako Tasks

Slack-native tasking with gated installation, OAuth, and a JWT-secured dashboard.

## Monorepo layout
```
/tako-tasks
  ├── backend/          # FastAPI service
  ├── frontend/         # Next.js + Tailwind dashboard & flows
  ├── docker-compose.yml
  └── .env.example
```

## Backend
- FastAPI with PostgreSQL (SQLAlchemy)
- Slack OAuth (`/slack/install`, `/slack/oauth/callback`)
- Access key issuance (`/request-access`, `/verify-key`)
- Slack slash command + interactive handlers (`/slack/commands`, `/slack/interactions`)
- Task CRUD REST API with filtering (`/tasks`)
- JWT auth for dashboard sessions (`/auth/login`, `/auth/slack`)

### Run locally
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Frontend
- Next.js 13 + TailwindCSS
- Pages: `/get-access`, `/unlock`, `/dashboard`

### Run locally
```bash
cd frontend
npm install
npm run dev
```

## Docker
Copy `.env.example` to `.env` and set values, then:
```bash
cd tako-tasks
docker-compose up --build
```
Services exposed on `localhost:8000` (API) and `localhost:3000` (dashboard).

## Environment variables
See `.env.example` for the full list of required values for Slack, Mailjet, JWT, and the database. For deployments, set `MAILJET_API_KEY`, `MAILJET_API_SECRET`, and `MAILJET_FROM_EMAIL` to real Mailjet credentials (the from email must be a verified sender) to avoid 400 responses from Mailjet. The backend now validates these values at runtime; if they are missing or left as placeholders, it will raise a clear error before attempting to call Mailjet.

## Database schema (core tables)
- `access_keys`: single-use unlock keys
- `workspaces`: Slack installation metadata
- `tasks`: main tasks table
- `task_history`: threaded updates/action log
