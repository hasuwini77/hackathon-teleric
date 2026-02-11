# Quick Start Guide - Learning Path Advisor

Get your AI-powered learning advisor up and running in 5 minutes!

## 🚀 Fast Track Deployment (Docker)

### 1️⃣ Clone & Setup (1 min)

```bash
cd /Users/ulf/hackathon-teleric

# Copy environment template
cp .env.example .env
```

### 2️⃣ Configure API Key (30 sec)

1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Go to [Keys page](https://openrouter.ai/keys)
3. Create new key and copy it
4. Edit `.env` and replace `your_openrouter_api_key_here` with your actual key:

```bash
OPENROUTER_API_KEY=sk-or-v1-YOUR-ACTUAL-KEY-HERE
```

### 3️⃣ Start Services (2 min)

```bash
docker-compose up -d
```

This will:
- ✅ Start PostgreSQL database
- ✅ Run database migrations
- ✅ Seed initial data
- ✅ Start FastAPI backend (port 5000)
- ✅ Start Next.js frontend (port 3000)
- ✅ Start pgAdmin (port 5050)

### 4️⃣ Open App (5 sec)

Open http://localhost:3000 in your browser!

---

## 📖 Production Deployment (Vercel + Neon)

### 1️⃣ Clone & Install (2 min)

```bash
cd /Users/ulf/hackathon-teleric
npm install
```

### 2️⃣ Set Up Neon Database (1 min)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project (any name)
3. Copy the connection string from the dashboard

### 3️⃣ Get OpenRouter API Key (1 min)

1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Go to [Keys page](https://openrouter.ai/keys)
3. Create new key and copy it

### 4️⃣ Configure Environment (30 sec)

Create `.env.local` file:

```bash
cat > .env.local << 'EOF'
DATABASE_URL=postgresql://your-connection-string-here
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENAI_MODEL=openai/gpt-4o-mini
EOF
```

Replace the placeholder values with your actual credentials.

### 5️⃣ Deploy to Vercel (1 min)

```bash
npm i -g vercel
vercel login
vercel
```

Follow the prompts:

- Set up and deploy? **Y**
- Which scope? (choose your account)
- Link to existing project? **N**
- What's your project's name? (press Enter for default)
- In which directory is your code located? \*\*./` (press Enter)

Then add environment variables:

```bash
vercel env add DATABASE_URL
# Paste your Neon connection string

vercel env add OPENROUTER_API_KEY
# Paste your OpenRouter key

vercel env add OPENAI_MODEL
# Enter: openai/gpt-4o-mini
```

Deploy again to use the new env vars:

```bash
vercel --prod
```

**Done!** 🎉 Your app is live at the URL shown.

## 🧪 Test Locally First

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Run development server
vercel dev

# Visit http://localhost:3000/chat
```

## 📱 Using the Chat Interface

1. Go to your deployed URL + `/chat`
2. The agent will greet you
3. Tell it what you want to learn
4. Answer follow-up questions about:
   - Your current experience
   - Time availability
   - Learning preferences
5. Receive a personalized learning roadmap!

## 🔧 Troubleshooting

### "OPENROUTER_API_KEY not configured"

- Run: `vercel env add OPENROUTER_API_KEY` and redeploy

### "Database initialization failed"

- Check your `DATABASE_URL` is correct
- Ensure it ends with `?sslmode=require`
- Verify Neon project is active

### Function timeout

- Check Vercel function logs: `vercel logs`
- Consider upgrading OpenRouter model if too slow

### Import errors in Python

- Ensure `pyproject.toml` is in project root
- Redeploy: `vercel --prod`

## 💰 Cost Breakdown

All on free tiers:

- **Vercel**: Free (Hobby plan includes 100GB bandwidth)
- **Neon**: Free (0.5GB storage, 3 compute hours/month)
- **OpenRouter**: Pay-as-you-go (~$0.001/conversation with gpt-4o-mini)

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
