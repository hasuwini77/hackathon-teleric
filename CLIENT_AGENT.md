# Learning Path Advisor - Client-Side Agent

The chat agent now runs entirely in the Next.js frontend with localStorage persistence.

## Architecture

```
Browser (localStorage) → Next.js Frontend → Next.js API Routes → OpenRouter API
```

**Key Components:**

- `lib/chat-agent.ts` - Client-side agent with localStorage state management
- `app/api/openrouter/route.ts` - Proxy API route for OpenRouter calls (keeps API key secure)
- `components/learning-path-chat.tsx` - React component for chat UI

## Setup

1. **Add your OpenRouter API key to `.env.local`:**

   ```bash
   OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Run the development server:**

   ```bash
   npm run dev
   ```

4. **Open the app:**
   ```
   http://localhost:3000/chat
   ```

## How It Works

1. **Agent Initialization**: When you visit `/chat`, a new agent instance is created with a unique session ID
2. **State Management**: All conversation history and memory are stored in browser localStorage
3. **OpenRouter Calls**: The agent makes requests to `/api/openrouter` (Next.js API route) which forwards to OpenRouter
4. **Memory Extraction**: After each exchange, the agent extracts structured information (objective, experience, etc.)
5. **Learning Path Generation**: When enough context is gathered, the agent creates a personalized learning path
6. **Persistence**: Everything is saved to localStorage - refresh the page and your conversation continues

## State Structure

```typescript
{
  objective: string | null
  relevant_experience: string | null
  background: string | null
  skill_level: string | null
  constraints: Record<string, any>
  interests: string[]
  learning_path_created: boolean
  scheduled_actions: string[]
}
```

## API Routes

### `/api/openrouter` (POST)

Proxies requests to OpenRouter API, keeping your API key secure on the server.

**Request:**

```json
{
  "messages": [...],
  "temperature": 0.7,
  "max_tokens": 800,
  "response_format": { ... } // optional
}
```

### `/api/learning-paths` (POST)

Logs learning path creation (can be extended to save to database).

**Request:**

```json
{
  "session_id": "session_xxx",
  "memory": { ... },
  "learning_path": "..."
}
```

## Deployment

For Vercel deployment, just set the environment variable:

```bash
vercel env add OPENROUTER_API_KEY
```

No Python API or database required!
