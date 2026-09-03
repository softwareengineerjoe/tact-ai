# TACT AI

**Team Assembly, Coordination, and Tracking** — an AI-powered platform for
building, coordinating, and tracking internal project teams.

The single source of truth for scope, architecture, and standards is
[docs/MASTER.md](docs/MASTER.md). All engineering work follows the binding
standards in [docs/](docs) and the coding-agent rules in
[.github/copilot-instructions.md](.github/copilot-instructions.md).

## Monorepo layout

```text
apps/
  web/     # React 19 + TypeScript frontend (Vite, Tailwind, TanStack Query)
  api/     # FastAPI (Python 3.14) backend (SQLAlchemy 2.x, Pydantic v2)
  worker/  # Background worker (added later)
packages/  # Shared UI / api-client / types (added later)
infra/     # Bicep IaC (added later)
docs/      # Product + engineering documentation (source of truth)
```

## Prerequisites

- Node.js 24 LTS + [pnpm](https://pnpm.io)
- Python 3.14 + [uv](https://docs.astral.sh/uv/)
- Docker Desktop (for local PostgreSQL 17)

## Getting started (local)

1. Copy environment defaults:

   ```powershell
   Copy-Item .env.example .env
   ```

2. Start PostgreSQL:

   ```powershell
   docker compose up -d db
   ```

3. Backend:

   ```powershell
   cd apps/api
   uv sync
   uv run alembic upgrade head
   uv run uvicorn app.main:app --reload
   ```

4. Frontend:

   ```powershell
   cd apps/web
   pnpm install
   pnpm dev
   ```

## Quality gates

- Frontend: `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm playwright test`
- Backend: `ruff check .`, `ruff format --check .`, `mypy app`, `pytest`
