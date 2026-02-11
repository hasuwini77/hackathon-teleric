#!/bin/sh
set -e

echo "🔧 Starting API setup..."

# Wait for database
echo "⏳ Waiting for database..."
sleep 5

# Run migrations
echo "🔄 Running migrations..."
alembic upgrade head

# Seed database
echo "🌱 Seeding database..."
python api/manage_db.py seed

# Start API server
echo "🚀 Starting API server..."
exec python -m uvicorn api.main:app --host 0.0.0.0 --port 5000 --reload
