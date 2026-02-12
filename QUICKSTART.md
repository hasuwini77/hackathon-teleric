# Quick Start Guide - Learning Path Advisor

Get your AI-powered learning advisor up and running in 2 minutes!

## 🚀 Local Development

### 1️⃣ Install Dependencies (30 sec)

```bash
npm install
```

### 2️⃣ Configure API Key (30 sec)

1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Go to [Keys page](https://openrouter.ai/keys)
3. Create new key and copy it
4. Edit `.env.local` and add your key:

```bash
OPENROUTER_API_KEY=sk-or-v1-YOUR-ACTUAL-KEY-HERE
```

### 3️⃣ Start Development Server (30 sec)

```bash
npm run dev
```

### 4️⃣ Open App (5 sec)

Open http://localhost:3000/chat in your browser!

---

## 📖 Production Deployment (Vercel)

### 1️⃣ Push to GitHub (1 min)

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2️⃣ Deploy to Vercel (2 min)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Add environment variable:
   - Name: `OPENROUTER_API_KEY`
   - Value: `sk-or-v1-your-actual-key`
5. Click "Deploy"

That's it! Your app is live.

---

## 🎯 Features

- **Client-Side Agent**: Runs entirely in the browser with localStorage persistence
- **Conversational AI**: Natural dialogue to understand your learning goals
- **Memory Extraction**: Automatically extracts objectives, experience, and constraints
- **Personalized Paths**: Creates 3-6 milestone learning plans with projects
- **No Database Required**: Everything stored in browser localStorage
- **Secure**: API key never exposed to client (kept on Next.js server)

## 📁 Project Structure

```
app/
  api/
    openrouter/route.ts     # Proxy for OpenRouter API calls
    learning-paths/route.ts # Learning path logging
  chat/page.tsx             # Chat interface
components/
  learning-path-chat.tsx    # Main chat component
lib/
  chat-agent.ts             # Client-side agent with localStorage
```

## 🔧 How It Works

1. User opens `/chat` → Agent initialized with unique session ID
2. Agent loads state from localStorage (or starts fresh)
3. User sends message → Agent calls `/api/openrouter`
4. Next.js API route forwards to OpenRouter (keeping API key secure)
5. Response returned → Agent extracts structured info (objective, experience)
6. Agent saves state to localStorage
7. When ready → Agent generates personalized learning path

## 💡 Tips

- **Persistence**: Conversation continues even after page reload
- **Clear Session**: Open DevTools → Application → Local Storage → Delete items
- **Cost**: Uses OpenRouter credits (~$0.001-0.01 per conversation)
- **Models**: Default is `gpt-4o-mini` (fast & cheap), change in `.env.local`

## 🚨 Troubleshooting

### "OpenRouter API request failed"

- Check your API key in `.env.local`
- Verify you have credits at openrouter.ai/credits

### "Agent initialization error"

- Clear browser localStorage
- Hard refresh (Cmd+Shift+R)

### Chat not loading

- Check browser console for errors
- Ensure Next.js dev server is running (`npm run dev`)

---

## 📚 Next Steps

- Check out `CLIENT_AGENT.md` for detailed architecture
- Customize the agent prompts in `lib/chat-agent.ts`
- Add database persistence if needed (optional)

Add $5 credit to OpenRouter to start chatting.

## 🎯 Next Steps

- [ ] Customize the agent prompts in `/api/chat.py`
- [ ] Add authentication for production use
- [ ] Set up rate limiting via Vercel Edge Middleware
- [ ] Add analytics to track usage
- [ ] Customize the UI theme in `/app/globals.css`

## 📚 More Resources

- [Full Deployment Guide](./DEPLOYMENT.md)
- [Python API Documentation](./api/README.md)
- [Vercel Python Runtime Docs](https://vercel.com/docs/functions/runtimes/python)

## 🆘 Need Help?

1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section
2. Review Vercel function logs: `vercel logs your-project`
3. Test API endpoint: `curl -X POST https://your-url/api/chat -H "Content-Type: application/json" -d '{"session_id":"test","action":"init"}'`
