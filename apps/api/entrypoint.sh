#!/bin/sh
# Container startup: apply migrations, seed synthetic demo data, then serve.
set -e

echo "Running database migrations..."
alembic upgrade head

echo "Seeding synthetic demo data (idempotent)..."
python -m app.seed || echo "Seed step skipped or already applied."

echo "Starting API on :8000"
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
