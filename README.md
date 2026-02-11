# MentorAI - Smart Learning Platform 🚀

A modern, AI-powered learning mentor with a beautiful 3D interface built with **Next.js 15**, **Python AI Agent**, and **Tailwind CSS v4**.

## ✨ What It Does

MentorAI is your personal learning path advisor that helps you:

- **Guided Conversations**: FSM-based agent that interviews you about your goals
- **Experience Assessment**: Understands your current skill level
- **Personalized Learning Paths**: Creates minimum viable learning roadmaps
- **Persistent Sessions**: Conversations saved to database, resume anytime
- **Visual Feedback**: Interactive 3D avatar and modern UI

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** - React framework
- **Tailwind CSS v4** - Modern utility-first CSS
- **React Three Fiber** - 3D graphics
- **shadcn/ui** - Beautiful UI components
- **TypeScript** - Type safety

### Backend

- **Python 3.12** - Serverless functions on Vercel
- **OpenRouter API** - Access to multiple LLM providers
- **Neon PostgreSQL** - Serverless database for state persistence
- **FSM Pattern** - Structured conversation flow

## 🚀 Quick Start

See [QUICKSTART.md](./QUICKSTART.md) for 5-minute deployment guide.

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables (see .env.example)
cp .env.example .env.local

# 3. Run development server
vercel dev

# 4. Deploy to production
vercel --prod
```

## 📁 Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main homepage
│   └── chat/page.tsx           # Learning path chat interface
├── api/                         # Python serverless functions
│   ├── chat.py                 # Main agent FSM + OpenRouter
│   ├── db.py                   # Neon PostgreSQL utilities
│   ├── health.py               # Health check endpoint
│   └── README.md               # Python API documentation
├── components/
│   ├── agent-avatar.tsx        # 3D animated avatar
│   ├── chat-panel.tsx          # Chat interface
│   ├── learning-path-chat.tsx  # FSM agent chat UI
│   ├── profile-panel.tsx       # User profile form
│   └── ui/                     # shadcn components
├── styles/
│   └── globals.css             # Tailwind v4 theme
├── pyproject.toml              # Python dependencies
├── requirements.txt            # Python deps (fallback)
├── vercel.json                 # Vercel config (Next.js + Python)
└── README.md                   # This file
```

## 🎨 How It Works

### Learning Path Agent (`/chat`)

1. **Ask About Objective**: Agent learns what you want to achieve
2. **Assess Experience**: Evaluates your current skill level
3. **Gather Constraints**: Time, budget, preferences
4. **Build Learning Path**: Generates 3-6 milestone roadmap with:
   - Learning objectives
   - Concrete projects to build
   - Recommended resources
   - Validation criteria
   - Time estimates

## 🎯 API Endpoints

### `POST /api/chat`

Main agent conversation endpoint

**Initialize session:**

```json
{
  "session_id": "unique_session_id",
  "action": "init"
}
```

**Send message:**

```json
{
  "session_id": "unique_session_id",
  "message": "I want to learn React",
  "action": "chat"
}
```

**Response:**

```json
{
  "message": "Great! What's your current experience with JavaScript?",
  "state": "AskAboutRelevantExperience",
  "session_id": "unique_session_id"
}
```

### `GET /api/health`

Health check endpoint

```bash
curl https://your-app.vercel.app/api/health
```

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Get deployed in 5 minutes
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Full deployment guide with troubleshooting
- **[api/README.md](./api/README.md)** - Python API documentation
- **[COMPONENT-GUIDE.md](./COMPONENT-GUIDE.md)** - UI components guide

## 🔑 Environment Variables

```bash
# Required
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
OPENROUTER_API_KEY=sk-or-v1-...

# Optional
OPENAI_MODEL=openai/gpt-4o-mini  # Default model
```

See [.env.example](./.env.example) for full template.

## 🎨 Tailwind v4 Features

**What's New:**

- No more `tailwind.config.ts` file needed!
- Use `@theme` in CSS instead of JS config
- CSS variables for colors (easier customization)
- Faster builds with new PostCSS plugin

**Example:**

```css
@theme {
  --color-primary: #14d9f5; /* Cyan/blue */
  --color-accent: #ffb347; /* Orange */
}
```

Then use in components:

```jsx
style={{ backgroundColor: 'var(--color-primary)' }}
```

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Open http://localhost:3000
```

## 📝 Key Files to Understand

1. **`styles/globals.css`** - Theme colors & design tokens
2. **`app/page.tsx`** - Main layout structure
3. **`components/chat-panel.tsx`** - Chat logic (connect AI here)
4. **`components/profile-panel.tsx`** - Form handling

## 🔧 Customization

### Change Colors

Edit `styles/globals.css`:

```css
@theme {
  --color-primary: #your-color;
  --color-background: #your-bg;
}
```

### Customize Agent Behavior

Edit `api/chat.py` to modify:

- System prompts per state
- State transition logic
- Extraction schema
- Response formatting

### Change AI Model

Set environment variable:

```bash
OPENAI_MODEL=openai/gpt-4o  # More capable
OPENAI_MODEL=anthropic/claude-3.5-sonnet  # Best reasoning
```

See all models at [openrouter.ai/models](https://openrouter.ai/models)

## 💡 Architecture Highlights

- **Stateless HTTP → Stateful Agent**: Session-based conversations with DB persistence
- **FSM Pattern**: Structured conversation flow prevents aimless chat
- **Structured Extraction**: LLM extracts key info with fallback strategies
- **Serverless**: Both frontend and backend scale automatically
- **Type Safety**: TypeScript + Python type hints throughout

## 🎯 Production Considerations

- [ ] Add authentication (NextAuth.js recommended)
- [ ] Implement rate limiting (Vercel Edge Middleware)
- [ ] Set up monitoring (Vercel Analytics + Logs)
- [ ] Add session cleanup (delete old conversations)
- [ ] Configure CORS properly for your domain
- [ ] Add input sanitization and validation
- [ ] Set up error tracking (Sentry)
- [ ] Add user analytics (PostHog, Mixpanel)

## 📚 Learn More

- [Tailwind CSS v4 Docs](https://tailwindcss.com/blog/tailwindcss-v4-beta)
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Vercel Python Runtime](https://vercel.com/docs/functions/runtimes/python)
- [OpenRouter Documentation](https://openrouter.ai/docs)
- [Neon Postgres](https://neon.tech/docs)

## 🐛 Troubleshooting

**Python function not working?**

- Check `vercel logs` for errors
- Verify environment variables in Vercel dashboard
- Test locally with `vercel dev`

**Database errors?**

- Ensure `DATABASE_URL` includes `?sslmode=require`
- Check Neon project is active
- Verify schema was created (check logs)

**Chat not responding?**

- Check browser console for errors
- Verify `/api/chat` returns 200
- Check OpenRouter API key has credits

See [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting) for more.

## 🤝 Contributing

This is a hackathon project! Feel free to:

- Add authentication system
- Implement conversation history UI
- Add more AI providers
- Create learning path templates
- Improve error handling
- Add unit tests

## 📄 License

MIT - feel free to use for your own projects!

---

**Built for Teleric Hackathon 2026** 🚀

Made with Next.js, Python, and AI • Deployed on Vercel
