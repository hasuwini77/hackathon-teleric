# Docker Compose Local Development

## Quick Start

### 1. Prerequisites

- Docker Desktop installed and running
- OpenRouter API key

### 2. Setup Environment

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local and add your OpenRouter API key
nano .env.local
```

### 3. Start Services

```bash
# Build and start all services
docker-compose up --build

# Or use make command
make init  # First time setup (runs migrations and seeds DB)
make up    # Subsequent starts
```

### 4. Access Services

- **Frontend**: http://localhost:3000
- **API**: http://localhost:5000
- **API Docs**: http://localhost:5000/docs
- **pgAdmin**: http://localhost:5050
  - Email: `admin@teleric.local`
  - Password: `admin`

## Services

### PostgreSQL Database

- Port: `5432`
- Database: `teleric_learning`
- User: `teleric`
- Password: `teleric_dev_password`

### Python API (FastAPI)

- Port: `5000`
- Hot reload enabled
- Auto-runs migrations on startup
- Seeds initial data

### Next.js Frontend

- Port: `3000`
- Hot reload enabled
- Connected to local API

### pgAdmin

- Port: `5050`
- Database management UI
- Connect to PostgreSQL using:
  - Host: `postgres`
  - Port: `5432`
  - Database: `teleric_learning`
  - User: `teleric`
  - Password: `teleric_dev_password`

## Useful Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Stop Services

```bash
docker-compose down
```

### Stop and Remove Volumes (Clean Slate)

```bash
docker-compose down -v
```

### Rebuild Containers

```bash
docker-compose up --build
```

### Run Database Migrations

```bash
docker-compose exec api alembic upgrade head
```

### Create Migration

```bash
docker-compose exec api alembic revision --autogenerate -m "description"
```

### Seed Database

```bash
docker-compose exec api python api/manage_db.py seed
```

### View Database Stats

```bash
docker-compose exec api python api/manage_db.py stats
```

### Access Database CLI

```bash
docker-compose exec postgres psql -U teleric -d teleric_learning
```

### Access API Container

```bash
docker-compose exec api bash
```

### Access Frontend Container

```bash
docker-compose exec frontend sh
```

## Development Workflow

### Making Changes

1. **Backend Changes** (Python)
   - Edit files in `api/`
   - FastAPI auto-reloads on file changes
   - Changes reflect immediately

2. **Frontend Changes** (Next.js)
   - Edit files in `app/`, `components/`, etc.
   - Next.js auto-reloads
   - Changes reflect immediately

3. **Database Changes**
   - Edit `api/models.py`
   - Create migration: `docker-compose exec api alembic revision --autogenerate -m "description"`
   - Apply migration: `docker-compose exec api alembic upgrade head`

### Testing API Endpoints

```bash
# Health check
curl http://localhost:5000/health

# Initialize chat
curl -X POST http://localhost:5000/api/chat/init?session_id=test123

# Send message
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"session_id": "test123", "message": "I want to learn Python"}'

# Get stats
curl http://localhost:5000/api/stats
```

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### API Not Starting

```bash
# Check API logs
docker-compose logs api

# Rebuild API container
docker-compose up --build api
```

### Port Already in Use

```bash
# Stop conflicting services
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:5000 | xargs kill -9  # API
lsof -ti:5432 | xargs kill -9  # PostgreSQL
```

### Clean Start

```bash
# Remove all containers, volumes, and rebuild
docker-compose down -v
docker-compose up --build
```

## Production Considerations

This setup is for **local development only**. For production:

- Use secure passwords
- Enable SSL/TLS
- Use managed database (Neon, AWS RDS, etc.)
- Deploy API to serverless (Vercel Functions)
- Deploy frontend to Vercel/Netlify
- Use environment-specific configurations
- Enable proper logging and monitoring

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│     API     │────▶│  PostgreSQL │
│  (Next.js)  │     │  (FastAPI)  │     │             │
│  Port 3000  │     │  Port 5000  │     │  Port 5432  │
└─────────────┘     └─────────────┘     └─────────────┘
                            │
                            ▼
                    ┌─────────────┐
                    │   pgAdmin   │
                    │  Port 5050  │
                    └─────────────┘
```

All services connected via Docker network for secure communication.
