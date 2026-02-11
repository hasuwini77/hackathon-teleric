# Pre-Deployment Checklist

Use this checklist before deploying to production.

## ✅ Configuration

- [ ] Created Neon database account
- [ ] Copied Neon connection string
- [ ] Created OpenRouter account
- [ ] Generated OpenRouter API key
- [ ] Created `.env.local` with all required variables
- [ ] Tested environment variables locally

## ✅ Local Testing

- [ ] Run `npm install` successfully
- [ ] Run `vercel dev` without errors
- [ ] Visit `http://localhost:3000/api/health` - returns 200
- [ ] Visit `http://localhost:3000/chat` - UI loads
- [ ] Send test message - receives response
- [ ] Check database - conversation saved
- [ ] Test session persistence (refresh page)

## ✅ Code Quality

- [ ] No console.log statements in production code
- [ ] Error handling in place
- [ ] CORS headers configured
- [ ] Environment variables used (no hardcoded secrets)
- [ ] Python imports working (no import errors)
- [ ] TypeScript compiles without errors
- [ ] Git committed all changes

## ✅ Vercel Setup

- [ ] Installed Vercel CLI (`npm i -g vercel`)
- [ ] Logged into Vercel (`vercel login`)
- [ ] Connected to GitHub (if using Git integration)
- [ ] Project name decided

## ✅ Environment Variables (Vercel)

Add these via Vercel dashboard or CLI:

```bash
vercel env add DATABASE_URL
# Paste: postgresql://user:pass@host/db?sslmode=require

vercel env add OPENROUTER_API_KEY
# Paste: sk-or-v1-...

vercel env add OPENAI_MODEL
# Enter: openai/gpt-4o-mini
```

- [ ] DATABASE_URL added (production)
- [ ] OPENROUTER_API_KEY added (production)
- [ ] OPENAI_MODEL added (optional)

## ✅ Deployment

```bash
# Preview deployment
vercel

# Test preview URL
# curl https://your-app-hash.vercel.app/api/health

# Production deployment
vercel --prod
```

- [ ] Preview deployment successful
- [ ] Preview URL tested
- [ ] Production deployment successful
- [ ] Production URL tested

## ✅ Post-Deployment Verification

### Health Check

```bash
curl https://your-app.vercel.app/api/health
```

Expected:

```json
{
  "status": "healthy",
  "service": "learning-path-agent",
  "checks": {
    "database_configured": true,
    "api_key_configured": true
  }
}
```

- [ ] Health endpoint returns 200
- [ ] Both checks show `true`

### Chat Interface

- [ ] Visit `https://your-app.vercel.app/chat`
- [ ] UI loads without errors
- [ ] Initial message appears
- [ ] Send test message
- [ ] Receives AI response
- [ ] State indicator updates

### Database Verification

```bash
# Connect to Neon
psql $DATABASE_URL

# Check table exists
\dt

# Check conversation saved
SELECT session_id, state, objective FROM conversations ORDER BY created_at DESC LIMIT 5;
```

- [ ] Conversations table exists
- [ ] Test conversation saved
- [ ] State persists correctly

### Vercel Dashboard

- [ ] Check Functions tab - no errors
- [ ] Check Analytics (if enabled)
- [ ] Review function duration (<10s typical)
- [ ] Check memory usage (<512 MB)

## ✅ Monitoring Setup

- [ ] Set up Vercel alerts for function errors
- [ ] Monitor Neon database usage
- [ ] Check OpenRouter usage and credits
- [ ] Bookmark Vercel logs URL

## ✅ Documentation

- [ ] Update README with production URL
- [ ] Document any custom configurations
- [ ] Share credentials securely with team
- [ ] Note any deployment issues encountered

## ✅ Security (Production)

- [ ] Reviewed CORS settings
- [ ] Considered authentication requirement
- [ ] Planned rate limiting strategy
- [ ] Reviewed error messages (no sensitive data)
- [ ] Set up monitoring for suspicious activity

## ✅ Performance

- [ ] Tested with multiple concurrent users
- [ ] Checked response times (<3s typical)
- [ ] Monitored database connection pooling
- [ ] Verified bundle size (<250 MB)

## ✅ Backup Plan

- [ ] Documented rollback procedure
- [ ] Noted previous working version
- [ ] Have database backup strategy
- [ ] Emergency contacts listed

## 🚀 Ready to Deploy!

Once all items are checked:

```bash
vercel --prod
```

## 🆘 If Deployment Fails

1. Check Vercel build logs
2. Verify environment variables
3. Test locally with `vercel dev`
4. Check [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting
5. Review function logs: `vercel logs`

## 📊 Post-Launch Monitoring (First 24h)

- [ ] Hour 1: Check for errors in Vercel logs
- [ ] Hour 2: Verify database connections stable
- [ ] Hour 6: Review function execution times
- [ ] Hour 12: Check OpenRouter usage/cost
- [ ] Hour 24: Analyze user behavior (if analytics set up)

## 📝 Notes

Use this section for deployment-specific notes:

```
Date: _____________
Deployed by: _____________
Production URL: _____________
Issues encountered: _____________
Resolution: _____________
```

## ✅ Sign-off

Deployment reviewed and approved by:

- [ ] Developer: ****\_\_\_\_****
- [ ] Date: ****\_\_\_\_****
- [ ] All checks passed: ✅

---

**Remember**: You can always redeploy with `vercel --prod` if issues arise!
