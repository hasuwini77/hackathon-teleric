# Development Guide

Guide for developers working on the Learning Path Advisor project.

## Prerequisites

- Node.js 18+ and npm
- Python 3.12+
- Git
- Vercel CLI (optional, for local testing)

## Local Development Setup

### 1. Clone and Install

```bash
cd /Users/ulf/hackathon-teleric
npm install
```

### 2. Environment Setup

Create `.env.local`:

```bash
# Database (use local Postgres or Neon free tier)
DATABASE_URL=postgresql://user:pass@localhost:5432/learning_path

# OpenRouter (get free key at openrouter.ai)
OPENROUTER_API_KEY=sk-or-v1-...

# Optional: Model selection
OPENAI_MODEL=openai/gpt-4o-mini
```

### 3. Database Setup

**Option A: Local PostgreSQL**

```bash
# Install PostgreSQL (macOS)
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb learning_path

# Update DATABASE_URL in .env.local
DATABASE_URL=postgresql://localhost:5432/learning_path
```

**Option B: Neon (Recommended)**

- Sign up at neon.tech (free tier)
- Copy connection string
- Use in `.env.local`

### 4. Run Development Server

```bash
# Option 1: Next.js only (frontend)
npm run dev

# Option 2: Full stack with Python functions
vercel dev
```

Visit `http://localhost:3000/chat` to test.

## Project Structure

### Frontend (`/app`, `/components`)

```
app/
├── layout.tsx          # Root layout with providers
├── page.tsx            # Original homepage
└── chat/
    └── page.tsx        # Learning path chat interface

components/
├── learning-path-chat.tsx   # Main chat component
├── ui/                      # shadcn/ui components
└── [other].tsx             # Legacy components
```

### Backend (`/api`)

```
api/
├── __init__.py         # Python module init
├── chat.py             # Agent FSM + OpenRouter integration
├── db.py               # Database utilities
└── health.py           # Health check endpoint
```

## Development Workflow

### Frontend Development

1. **Create new component**:

```bash
# Add to /components
touch components/your-component.tsx
```

2. **Use shadcn components**:

```bash
# Already installed, just import
import { Button } from '@/components/ui/button'
```

3. **Style with Tailwind**:

```tsx
<div className="flex gap-4 p-6 rounded-lg bg-card">{/* Your content */}</div>
```

4. **Test in browser**:

- Edit file
- Save (auto-reloads)
- Check `http://localhost:3000`

### Backend Development

1. **Edit Python functions**:

```bash
# Make changes to api/chat.py or api/db.py
# Vercel dev auto-reloads Python functions
```

2. **Test API endpoint**:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"session_id":"test","action":"init"}'
```

3. **Check logs**:

```bash
# Vercel dev shows logs in terminal
# Or use: vercel logs
```

4. **Debug database**:

```bash
# Connect to Neon via psql
psql $DATABASE_URL

# Check conversations table
SELECT * FROM conversations;
```

## Testing

### Manual Testing Checklist

**Frontend:**

- [ ] Chat UI loads without errors
- [ ] Messages send and receive
- [ ] Auto-scroll works
- [ ] Loading states show correctly
- [ ] Error states handled gracefully
- [ ] Responsive on mobile

**Backend:**

- [ ] `/api/health` returns 200
- [ ] Session initialization works
- [ ] Messages persist to database
- [ ] State transitions correctly
- [ ] OpenRouter API calls succeed
- [ ] Error handling works

### Test API Endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# Initialize session
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test_123",
    "action": "init"
  }'

# Send message
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test_123",
    "message": "I want to learn Python",
    "action": "chat"
  }'
```

## Common Development Tasks

### Add a new agent state

1. Edit `api/chat.py`:

```python
class State(str, Enum):
    # ... existing states
    YourNewState = "YourNewState"
```

2. Add system prompt:

```python
state_focus = {
    # ... existing states
    State.YourNewState: "Your custom prompt..."
}
```

3. Add transition logic:

```python
def _advance_state_if_ready(self):
    # ... existing logic
    if self.state == State.SomeState and condition:
        self.state = State.YourNewState
```

### Modify UI styling

Edit `styles/globals.css`:

```css
@theme {
  --color-primary: #your-new-color;
}
```

Changes apply immediately (hot reload).

### Update database schema

Edit `api/db.py` → `init_db()`:

```python
cur.execute("""
    ALTER TABLE conversations
    ADD COLUMN your_new_field TEXT;
""")
```

Then drop/recreate table or run migration.

### Change AI model

Set in `.env.local`:

```bash
OPENAI_MODEL=anthropic/claude-3.5-sonnet
```

Or pass per-request (edit `chat.py`).

## Debugging Tips

### Python Function Errors

1. Check Vercel dev logs (terminal output)
2. Add print statements:

```python
print(f"Debug: {variable}")  # Shows in terminal
```

3. Check function logs:

```bash
vercel logs
```

### Frontend Errors

1. Open browser DevTools (F12)
2. Check Console tab for JS errors
3. Check Network tab for API failures
4. Use React DevTools extension

### Database Issues

1. Test connection:

```bash
psql $DATABASE_URL -c "SELECT 1"
```

2. Check table exists:

```bash
psql $DATABASE_URL -c "\dt"
```

3. View data:

```bash
psql $DATABASE_URL -c "SELECT * FROM conversations LIMIT 5"
```

## Code Style

### TypeScript/React

- Use functional components
- Prefer `const` over `let`
- Use TypeScript types/interfaces
- Follow React hooks rules
- Use shadcn components when possible

### Python

- Follow PEP 8
- Use type hints
- Keep functions focused (single responsibility)
- Document complex logic with comments
- Use dataclasses for structured data

## Deployment

### Preview Deployment

```bash
# Deploy to preview URL
vercel

# Test at: https://your-app-hash.vercel.app
```

### Production Deployment

```bash
# Deploy to production
vercel --prod

# Set environment variables first:
vercel env add DATABASE_URL
vercel env add OPENROUTER_API_KEY
```

### Post-Deployment Checks

1. Test health endpoint: `https://your-app.vercel.app/api/health`
2. Test chat: `https://your-app.vercel.app/chat`
3. Check Vercel logs for errors
4. Monitor database usage in Neon dashboard

## Performance Optimization

### Frontend

- Images: Use Next.js `<Image>` component
- Code splitting: Already handled by Next.js
- Bundle size: Check with `npm run build`

### Backend

- Database: Use connection pooling
- API calls: Cache responses when appropriate
- Bundle size: Keep under 250 MB (check `vercel build`)

## Git Workflow

```bash
# Create feature branch
git checkout -b feat/your-feature

# Make changes and commit
git add .
git commit -m "feat: your feature description"

# Push and create PR
git push origin feat/your-feature
```

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Python Runtime](https://vercel.com/docs/functions/runtimes/python)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [OpenRouter API](https://openrouter.ai/docs)
- [Neon Docs](https://neon.tech/docs)

## Getting Help

- Check [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting
- Review [api/README.md](./api/README.md) for Python details
- Search existing issues/PRs
- Create new issue with reproduction steps
