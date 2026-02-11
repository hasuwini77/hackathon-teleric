# Learning Path Advisor - Deployment Guide

This project combines a Next.js frontend with a Python-based AI agent backend, deployed on Vercel with Neon PostgreSQL for state persistence.

## Architecture

- **Frontend**: Next.js 14+ (React/TypeScript)
- **Backend**: Python 3.12 serverless function (`/api/chat.py`)
- **Database**: Neon PostgreSQL (serverless Postgres)
- **AI Provider**: OpenRouter API
- **Hosting**: Vercel (with Python runtime support)

## Setup Instructions

### 1. Database Setup (Neon)

1. Create a Neon account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string (it looks like: `postgresql://user:password@host/database?sslmode=require`)
4. The database table will be created automatically on first request

### 2. OpenRouter API Key

1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Go to [Keys](https://openrouter.ai/keys)
3. Create a new API key
4. Copy the key (starts with `sk-or-v1-...`)

### 3. Environment Variables

Create a `.env.local` file in the project root:

```bash
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENAI_MODEL=openai/gpt-4o-mini
```

### 4. Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at `http://localhost:3000`

### 5. Deploy to Vercel

#### Option A: Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

#### Option B: Deploy via GitHub

1. Push your code to GitHub
2. Import the repository in [Vercel Dashboard](https://vercel.com/new)
3. Add environment variables in the Vercel project settings:
   - `DATABASE_URL`
   - `OPENROUTER_API_KEY`
   - `OPENAI_MODEL` (optional)
4. Deploy

## Project Structure

```
/
├── api/
│   ├── __init__.py          # Python module init
│   ├── chat.py              # Main agent endpoint
│   └── db.py                # Database utilities
├── components/
│   └── learning-path-chat.tsx  # Chat UI component
├── app/
│   ├── layout.tsx
│   └── page.tsx
├── pyproject.toml           # Python project config
├── requirements.txt         # Python dependencies (fallback)
├── vercel.json              # Vercel configuration
└── .env.example             # Environment variables template
```

## API Endpoints

### POST `/api/chat`

Initialize a new session:

```json
{
  "session_id": "session_123",
  "action": "init"
}
```

Send a message:

```json
{
  "session_id": "session_123",
  "message": "I want to learn React",
  "action": "chat"
}
```

Response:

```json
{
  "message": "Great! What's your current experience with JavaScript?",
  "state": "AskAboutRelevantExperience",
  "session_id": "session_123"
}
```

## Agent States

The agent follows a finite state machine:

1. **AskAboutObjective**: Understand the user's learning goal
2. **AskAboutRelevantExperience**: Assess current knowledge and skills
3. **SaveAuxiliaryInformation**: Gather time constraints, preferences, etc.
4. **BuildMinimumLearningPath**: Generate personalized learning roadmap

## Database Schema

```sql
CREATE TABLE conversations (
    session_id VARCHAR(255) PRIMARY KEY,
    state VARCHAR(50) NOT NULL,
    objective TEXT,
    relevant_experience TEXT,
    auxiliary_information JSONB DEFAULT '{}',
    notes JSONB DEFAULT '[]',
    chat_history JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

## Customization

### Change AI Model

Edit `OPENAI_MODEL` environment variable. Available models:

- `openai/gpt-4o-mini` (fast, cheap)
- `openai/gpt-4o` (more capable)
- `anthropic/claude-3.5-sonnet` (best reasoning)
- See all models at [openrouter.ai/models](https://openrouter.ai/models)

### Modify Agent Behavior

Edit `/api/chat.py`:

- Adjust system prompts in `_system_prompt_for_state()`
- Modify state transitions in `_advance_state_if_ready()`
- Add new states to the `State` enum

## Troubleshooting

### Python function fails

- Check logs in Vercel dashboard (Functions tab)
- Ensure `pyproject.toml` or `requirements.txt` is in project root
- Verify environment variables are set in Vercel project settings
- Check Python version compatibility (3.12+ recommended)

### Import errors in Python

- Vercel automatically handles module imports from `/api` directory
- Use relative imports: `from .db import ...` or `from db import ...`
- Don't modify `sys.path` - let Vercel handle it

### Database connection errors

- Verify `DATABASE_URL` format includes `?sslmode=require`
- Check Neon project is active (not paused)
- Ensure IP is not blocked (Neon allows all by default)
- Test connection locally first

### Chat not responding

- Check browser console for errors
- Verify `/api/chat` endpoint is accessible (check Network tab)
- Check OpenRouter API key has credits
- Look at Vercel function logs for backend errors

### Bundle size exceeded (250 MB limit)

- Review `excludeFiles` pattern in `vercel.json`
- Remove unused dependencies from `pyproject.toml`/`requirements.txt`
- Don't include test files, fixtures, or large static assets
- Use `vercel build` locally to check bundle size

## Cost Estimates

- **Vercel**: Free tier includes serverless functions
- **Neon**: Free tier includes 0.5GB storage, 3 compute hours
- **OpenRouter**: ~$0.001 per conversation (using gpt-4o-mini)

For production, consider upgrading plans based on usage.
