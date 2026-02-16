#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"

cd "$SCRIPT_DIR"

echo "=== SKYE Database Setup ==="

# 1. Start PostgreSQL + pgvector
echo "[1/5] Starting PostgreSQL + pgvector..."
docker compose up -d
echo "  Waiting for Postgres to be ready..."
until docker compose exec -T db pg_isready -U skye -q 2>/dev/null; do
  sleep 1
done
echo "  Postgres is ready."

# 2. Create venv if missing
if [ ! -d "$BACKEND_DIR/.venv" ]; then
  echo "[2/5] Creating virtual environment..."
  cd "$BACKEND_DIR"
  uv venv
  cd "$SCRIPT_DIR"
else
  echo "[2/5] Virtual environment already exists."
fi

# 3. Install dependencies
echo "[3/5] Installing dependencies..."
cd "$BACKEND_DIR"
source .venv/bin/activate
uv pip install -r requirements.txt -q
cd "$SCRIPT_DIR"

# 4. Run migrations
echo "[4/5] Running migrations..."
source "$BACKEND_DIR/.venv/bin/activate"
alembic upgrade head

# 5. Seed data
echo "[5/5] Seeding skills..."
cd "$BACKEND_DIR"
source .venv/bin/activate
python database/seed_data.py

echo ""
echo "=== Setup complete ==="
echo "  Database: postgresql://skye:skye_dev@localhost:5432/skye"
echo "  Run server: cd $BACKEND_DIR && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000"
