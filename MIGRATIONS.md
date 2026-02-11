# Database Migration Strategy

## Overview

All database schema changes are managed through **Alembic migrations**, ensuring consistency across local, staging, and production environments.

## How It Works

### Local Development (Docker)

Migrations run automatically on container startup:

```bash
docker-compose up  # Auto-runs: alembic upgrade head
```

### Vercel (Production)

**Option 1: GitHub Actions (Recommended)**

Create `.github/workflows/migrate.yml`:

```yaml
name: Run Database Migrations

on:
  push:
    branches: [main]
    paths:
      - "alembic/versions/**"
      - "api/models.py"

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.11"

      - name: Install dependencies
        run: |
          pip install -r requirements.txt

      - name: Run migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          alembic upgrade head
```

**Option 2: Manual via CLI**

```bash
# Set your production database URL
export DATABASE_URL="postgresql://user:pass@host/db"

# Run migrations
alembic upgrade head
```

**Option 3: Vercel Build Hook**

Add to `vercel.json`:

```json
{
  "buildCommand": "pip install -r requirements.txt && alembic upgrade head && npm run build"
}
```

⚠️ **Note**: Vercel Functions are stateless, so migrations should run separately, not in the function code.

## Migration Workflow

### 1. Create a Migration

```bash
# Local
alembic revision --autogenerate -m "add user profile fields"

# Docker
make migrate-create
```

### 2. Review the Migration

Check the generated file in `alembic/versions/`:

```python
def upgrade() -> None:
    # Review these changes!
    op.add_column('users', sa.Column('avatar_url', sa.String(500)))
```

### 3. Test Locally

```bash
# Apply
alembic upgrade head

# Rollback if needed
alembic downgrade -1
```

### 4. Commit and Deploy

```bash
git add alembic/versions/*.py api/models.py
git commit -m "feat: add user avatar field"
git push
```

### 5. Production Migration

Migrations run via GitHub Actions or manually before deployment.

## Best Practices

### ✅ Do

- **Always review** generated migrations before committing
- **Test locally** before pushing to production
- **Use transactions** for data migrations
- **Keep migrations small** and focused
- **Add indexes** for foreign keys
- **Document breaking changes** in commit messages

### ❌ Don't

- **Don't run migrations in serverless functions** (cold starts!)
- **Don't modify old migrations** (create new ones instead)
- **Don't skip review** of auto-generated migrations
- **Don't delete tables** without a backup plan
- **Don't mix schema and data changes** in one migration

## Common Operations

### Add a Column

```bash
alembic revision --autogenerate -m "add email_verified to users"
```

### Create an Index

```python
def upgrade():
    op.create_index('idx_users_email', 'users', ['email'])
```

### Seed Data

```python
from sqlalchemy import table, column
from sqlalchemy.sql import insert

def upgrade():
    skills = table('skills',
        column('name', String),
        column('category', String)
    )

    op.bulk_insert(skills, [
        {'name': 'Python', 'category': 'Programming'},
        {'name': 'JavaScript', 'category': 'Programming'}
    ])
```

### Rollback

```bash
# Rollback one migration
alembic downgrade -1

# Rollback to specific revision
alembic downgrade abc123

# Show current version
alembic current

# Show history
alembic history
```

## Neon DB Specific

Neon (Vercel's database) supports:

- ✅ Standard PostgreSQL migrations
- ✅ Concurrent index creation
- ✅ Connection pooling
- ✅ Automatic backups

Just use the connection string from Neon:

```bash
DATABASE_URL="postgresql://user:pass@ep-xxx.region.neon.tech/db?sslmode=require"
```

## Troubleshooting

### "Target database is not up to date"

```bash
# Manually upgrade
alembic upgrade head
```

### "Can't locate revision"

```bash
# Stamp the database with current version
alembic stamp head
```

### "Duplicate table/column"

The migration was partially applied. Either:

1. Complete it manually in psql
2. Rollback and reapply: `alembic downgrade -1 && alembic upgrade head`

## Summary

**Local**: Migrations run automatically in Docker
**Production**: Run via GitHub Actions or manually before deploy
**Never**: Run migrations in serverless function code

All environments use the same Alembic migrations for consistency! 🎯
