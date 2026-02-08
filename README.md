# MentorAI - Smart Learning Platform 🚀

A modern, AI-powered learning mentor with a beautiful 3D interface built with **Next.js 15** and **Tailwind CSS v4**.

## ✨ What It Does

MentorAI is your personal career coach that helps you:
- **Build Your Profile**: Add skills, experience, and learning goals
- **Get Personalized Advice**: AI-powered chat that understands your background
- **Discover Courses**: Tailored course recommendations
- **Visual Feedback**: Interactive 3D avatar that responds when speaking

## 🛠️ Tech Stack (Simple!)

- **Next.js 15** - React framework for web apps
- **Tailwind CSS v4** - Modern utility-first CSS (latest version!)
- **React Three Fiber** - 3D graphics for the avatar
- **Vercel AI SDK** - For chat functionality (ready to connect)
- **TypeScript** - Type safety

## 📁 Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main page (homepage)
├── components/
│   ├── agent-avatar.tsx    # 3D animated sphere avatar
│   ├── chat-panel.tsx      # Chat interface with AI
│   ├── profile-panel.tsx   # User profile form
│   └── suggested-courses.tsx # Course recommendations
├── styles/
│   └── globals.css         # Tailwind v4 theme (colors, fonts)
└── package.json
```

## 🎨 How It Works

### 1. **Profile Panel** (Left Side)
   - Add your skills (click + button)
   - Select experience level
   - Write learning goals
   - Mobile-friendly with slide-out menu

### 2. **Chat Panel** (Center)
   - Talk to MentorAI
   - Click quick action buttons for common questions
   - Messages auto-scroll
   - Typing indicators

### 3. **Avatar + Courses** (Right Side - Desktop)
   - 3D animated sphere that pulses when "speaking"
   - Suggested courses based on your profile
   - Auto-hidden on mobile/tablet

## 🎨 Tailwind v4 Features

**What's New:**
- No more `tailwind.config.ts` file needed!
- Use `@theme` in CSS instead of JS config
- CSS variables for colors (easier customization)
- Faster builds with new PostCSS plugin

**Example:**
```css
@theme {
  --color-primary: #14d9f5;  /* Cyan/blue */
  --color-accent: #ffb347;   /* Orange */
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

### Add Real AI
In `chat-panel.tsx`, replace the `setTimeout` with:
```typescript
// Use Vercel AI SDK
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ message: input, profile })
});
```

## 💡 Tips for Learning

- **Start with `app/page.tsx`** - See how components connect
- **Inspect `globals.css`** - Learn Tailwind v4 theming
- **Modify `chat-panel.tsx`** - Practice React hooks
- **Play with colors** - Change CSS variables and see instant results

## 🎯 Why This Is Simple

1. **No complex state management** - Just React `useState`
2. **Inline styles for dynamic values** - Easy to understand
3. **Clear component separation** - Each file does ONE thing
4. **Comments where needed** - Not over-commented
5. **Modern but not overcomplicated** - Uses latest tech sensibly

## 📚 Learn More

- [Tailwind CSS v4 Docs](https://tailwindcss.com/blog/tailwindcss-v4-beta)
- [Next.js 15 Docs](https://nextjs.org/docs)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)

## 🤝 Contributing

This is a hackathon project! Feel free to:
- Add more course data
- Connect real AI APIs
- Improve 3D avatar animations
- Add more profile fields
- Make it responsive (already mobile-friendly!)

---

**Made with ❤️ for easy understanding and modern design**
