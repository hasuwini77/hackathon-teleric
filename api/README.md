# Python API - Learning Path Agent

This directory contains the Python serverless functions for the Learning Path Advisor agent.

## Files

- **`chat.py`**: Main agent endpoint implementing the FSM-based conversation flow
- **`db.py`**: Database utilities for Neon PostgreSQL persistence
- **`__init__.py`**: Python module initialization

## How It Works

### Request Flow

1. **Client** sends POST request to `/api/chat` with:

   ```json
   {
     "session_id": "unique_session_id",
     "message": "user message",
     "action": "chat" // or "init"
   }
   ```

2. **Handler** (`chat.py`) processes the request:
   - Validates session_id and environment variables
   - Initializes database connection
   - Loads existing conversation state (if any)
   - Creates/restores LearningPathAgent instance

3. **Agent** processes the message through FSM:
   - Extracts structured information (objective, experience, constraints)
   - Advances state machine based on gathered information
   - Generates contextual response using OpenRouter LLM
   - Persists updated state to Neon DB

4. **Response** returned to client:
   ```json
   {
     "message": "agent response",
     "state": "current_fsm_state",
     "session_id": "unique_session_id"
   }
   ```

### Finite State Machine

The agent follows 4 states:

1. **AskAboutObjective**: Understand learning goals
2. **AskAboutRelevantExperience**: Assess current skills
3. **SaveAuxiliaryInformation**: Gather constraints (time, budget, preferences)
4. **BuildMinimumLearningPath**: Generate personalized roadmap

### Database Schema

```sql
CREATE TABLE conversations (
    session_id VARCHAR(255) PRIMARY KEY,
    state VARCHAR(50) NOT NULL,
    objective TEXT,
    relevant_experience TEXT,
    auxiliary_information JSONB,
    notes JSONB,
    chat_history JSONB,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

## Local Development

### Prerequisites

```bash
# Python 3.12+
python --version

# Install dependencies
pip install -r ../requirements.txt

# Or using pyproject.toml
pip install -e ..
```

### Environment Variables

```bash
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
OPENROUTER_API_KEY=sk-or-v1-...
OPENAI_MODEL=openai/gpt-4o-mini  # optional
```

### Testing Locally

You can test the Python function locally using Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Run dev server
vercel dev

# Test endpoint
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test_123",
    "action": "init"
  }'
```

## Customization

### Change AI Behavior

Edit system prompts in `chat.py` → `_system_prompt_for_state()`:

```python
def _system_prompt_for_state(self) -> str:
    base = (
        "You are an AI learning advisor..."  # Customize this
    )

    state_focus = {
        State.AskAboutObjective: "Your custom prompt...",
        # ... customize each state
    }
```

### Modify State Transitions

Edit `_advance_state_if_ready()` to change when states advance:

```python
def _advance_state_if_ready(self) -> None:
    # Add your custom logic here
    if self.state == State.AskAboutObjective and self.memory.objective:
        # Add additional conditions if needed
        self.state = State.AskAboutRelevantExperience
```

### Add New States

1. Add to `State` enum:

```python
class State(str, Enum):
    AskAboutObjective = "AskAboutObjective"
    YourNewState = "YourNewState"  # Add here
```

2. Add system prompt in `_system_prompt_for_state()`
3. Add transition logic in `_advance_state_if_ready()`

## Vercel Deployment

### Configuration

The `vercel.json` in project root configures the Python runtime:

```json
{
  "functions": {
    "api/**/*.py": {
      "runtime": "python3.12",
      "maxDuration": 60,
      "excludeFiles": "..."
    }
  }
}
```

### Bundle Size Management

Python functions have a 250 MB uncompressed limit. To stay under:

1. **Only include necessary dependencies** in `pyproject.toml`/`requirements.txt`
2. **Exclude test/dev files** via `excludeFiles` in `vercel.json`
3. **Don't bundle static assets** or large data files

### Monitoring

View function logs in Vercel dashboard:

- Go to your project → Functions tab
- Click on `/api/chat` to see invocations
- Check errors, duration, and memory usage

## Error Handling

The handler includes comprehensive error handling:

- **400 Bad Request**: Invalid JSON, missing required fields
- **500 Internal Server Error**: Database errors, API key issues, agent failures

All errors return JSON:

```json
{
  "error": "Detailed error message"
}
```

## Performance Tips

1. **Connection Pooling**: Consider using `psycopg2.pool` for DB connections
2. **Caching**: Cache system prompts if they don't change often
3. **Streaming**: For long responses, consider streaming (future enhancement)
4. **Timeouts**: Default max duration is 60s - adjust in `vercel.json` if needed

## Security

- ✅ CORS enabled for frontend requests
- ✅ Environment variables for secrets
- ✅ Input validation and sanitization
- ✅ Error messages don't expose sensitive data
- ⚠️ Consider rate limiting for production (Vercel Edge Middleware)
- ⚠️ Add authentication if handling sensitive user data

## Debugging

Enable verbose logging by adding to `chat.py`:

```python
import logging
logging.basicConfig(level=logging.DEBUG)

# Then use in code:
logging.debug(f"Session: {session_id}, State: {self.state}")
```

View logs with:

```bash
vercel logs your-project-name
```
