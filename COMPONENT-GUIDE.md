# 🎨 MentorAI - Component Guide

Quick reference for understanding each component in the project.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         app/page.tsx                         │
│                     (Main Container)                         │
├──────────────┬─────────────────────┬────────────────────────┤
│              │                     │                        │
│  Profile     │    Chat Panel       │   Avatar + Courses     │
│  Panel       │    (Center)         │   (Right - Desktop)    │
│  (Left)      │                     │                        │
│              │                     │                        │
└──────────────┴─────────────────────┴────────────────────────┘
```

---

## 📦 Components Breakdown

### 1. **agent-avatar.tsx** (40 lines)
**What it does:** 3D animated sphere using Three.js

**Key features:**
- Rotates continuously
- Changes distortion when speaking
- Uses cyan (#14d9f5) color

**Simple explanation:**
- `Canvas` = 3D scene container
- `Sphere` = The 3D ball shape
- `MeshDistortMaterial` = Makes it wavy and shiny
- `useFrame` = Animation loop (runs every frame)

**When to modify:**
- Change `color="#14d9f5"` for different avatar color
- Adjust `distort` values for more/less wobble
- Change `speed` for faster/slower animation

---

### 2. **chat-panel.tsx** (170 lines)
**What it does:** Chat interface with AI

**Key features:**
- Message history display
- Input box with send button
- Quick action buttons
- Auto-scroll to latest message
- Loading indicator (3 bouncing dots)

**State management:**
```typescript
messages     // Array of chat messages
input        // Current input text
isLoading    // Shows "..." when AI is thinking
```

**Simple explanation:**
- Messages render in a loop (map function)
- Form handles submit (Enter or button click)
- `messagesEndRef` = Invisible div at bottom for scrolling
- Currently uses fake AI (setTimeout) - replace with real API

**When to modify:**
- Change `quickPrompts` array for different suggestions
- Replace `setTimeout` with actual AI call
- Adjust colors in `style` props

---

### 3. **profile-panel.tsx** (200 lines)
**What it does:** User profile form

**Key features:**
- Skills management (add/remove chips)
- Experience dropdown
- Goals textarea
- Mobile slide-out menu
- Overlay on mobile

**State management:**
```typescript
profile        // From parent (app/page.tsx)
newSkill       // Temporary input for adding skills
isOpen         // Panel visibility on mobile
```

**Simple explanation:**
- Input field + button = Add skill
- Each skill becomes a chip with X button
- Mobile: Panel slides from left, overlay closes it
- Desktop: Always visible

**When to modify:**
- Add more fields (education, location, etc.)
- Change experience levels in `<select>`
- Modify width (`w-80`) for different size

---

### 4. **suggested-courses.tsx** (60 lines)
**What it does:** Course recommendation cards

**Key features:**
- Static course list (for now)
- Color-coded icons
- Duration and level display
- Hover animation (scale up)

**Data structure:**
```typescript
{
  title: "Course Name",
  duration: "8 hours",
  level: "Beginner",
  color: "#14d9f5"
}
```

**Simple explanation:**
- Maps over `courses` array
- Each card has icon, title, metadata
- Icons use course color for consistency

**When to modify:**
- Replace `courses` array with real data
- Fetch from API based on user profile
- Add click handler to open course details

---

## 🎨 Styling System (Tailwind v4)

### Color Variables (in globals.css)

```css
--color-primary: #14d9f5        // Cyan (buttons, accents)
--color-accent: #ffb347          // Orange (secondary)
--color-background: #0a0e1a      // Dark blue/black
--color-foreground: #e8ecf4      // Light text
--color-card: #0f1420            // Card backgrounds
--color-border: #1f2633          // Borders
```

### Using Colors in Components

**Old way (Tailwind v3):**
```jsx
<div className="bg-primary text-white">
```

**New way (Tailwind v4):**
```jsx
<div style={{ backgroundColor: 'var(--color-primary)' }}>
```

**Why?** Tailwind v4 uses CSS variables directly = easier customization!

---

## 🔄 Data Flow

```
User Input (Profile Panel)
        ↓
profile state (app/page.tsx)
        ↓
Chat Panel receives profile
        ↓
User sends message
        ↓
(Future: API call with profile context)
        ↓
AI responds with personalized advice
```

---

## 🚀 Quick Customization Guide

### Change Primary Color
1. Open `styles/globals.css`
2. Find `--color-primary: #14d9f5`
3. Replace with your color (e.g., `#ff6b6b` for red)
4. Save - changes apply instantly!

### Add New Quick Action
1. Open `components/chat-panel.tsx`
2. Find `quickPrompts` array
3. Add: `"Your new prompt text"`

### Modify 3D Avatar
1. Open `components/agent-avatar.tsx`
2. Change `color="#14d9f5"` to your choice
3. Adjust `distort` values (higher = more wobble)

### Add Course Field
1. Open `components/suggested-courses.tsx`
2. Add property to course objects (e.g., `instructor: "John Doe"`)
3. Display in card template

---

## 📱 Responsive Behavior

| Screen Size | Layout |
|-------------|--------|
| Mobile (<1024px) | Profile panel slides out, Avatar hidden |
| Tablet (1024px+) | Profile visible, Avatar hidden |
| Desktop (1280px+) | All three panels visible |

**CSS Classes:**
- `lg:` = Large screens (1024px+)
- `xl:` = Extra large (1280px+)
- `hidden xl:flex` = Hidden until XL screen

---

## 💡 Common Tasks

### 1. Connect Real AI
```typescript
// In chat-panel.tsx, replace setTimeout with:
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    message: input, 
    profile: profile 
  })
});
const data = await response.json();
```

### 2. Save Profile to Database
```typescript
// In profile-panel.tsx, add useEffect:
useEffect(() => {
  // Debounce to avoid too many saves
  const timer = setTimeout(() => {
    fetch('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(profile)
    });
  }, 1000);
  return () => clearTimeout(timer);
}, [profile]);
```

### 3. Dynamic Course Recommendations
```typescript
// In suggested-courses.tsx:
const [courses, setCourses] = useState([]);

useEffect(() => {
  fetch('/api/courses?skills=' + profile.skills.join(','))
    .then(r => r.json())
    .then(setCourses);
}, [profile.skills]);
```

---

## 🎯 Key Takeaways

1. **Components are independent** - Easy to move or reuse
2. **State lives in parent** (`app/page.tsx`) - Simple data flow
3. **Styling uses CSS variables** - Change colors in one place
4. **No complex libraries** - Just React hooks + Tailwind
5. **Mobile-first** - Works on all devices

---

**Questions? Check the main README.md or ask in chat!** 💬
