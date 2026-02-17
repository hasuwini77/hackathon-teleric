"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StylishBackground from "@/components/landing/StylishBackground";
import CustomCursor from "@/components/landing/CustomCursor";
import FuturisticButton from "@/components/landing/FuturisticButton";
import ThemeToggle from "@/components/landing/ThemeToggle";
import { SessionStore } from "@/lib/session-store";
import { Sparkles } from "lucide-react";
import "./landing1/landing.css";

export default function Page() {
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const handleStartLearning = () => {
    const newId = SessionStore.generateSessionId();
    router.push(`/chat?session=${newId}`);
  };

  const toggleTheme = () => setTheme(prev => prev === "dark" ? "light" : "dark");

  return (
    <main className={`relative min-h-screen w-full overflow-hidden flex items-center justify-center cursor-none transition-colors duration-1000 ${theme === "dark" ? "bg-black" : "bg-white"}`}>
      {/* Custom Cursor */}
      <CustomCursor />

      {/* 3D Interactive Background */}
      <StylishBackground theme={theme} />

      {/* Theme Switcher */}
      <ThemeToggle isDark={theme === "dark"} onToggle={toggleTheme} />

      {/* Immersive Overlay */}
      <div className={`absolute inset-0 pointer-events-none ${theme === "dark" ? "bg-gradient-to-b from-transparent via-transparent to-slate-950/40" : "bg-gradient-to-b from-transparent to-blue-50/20"}`} />

      {/* Center Content */}
      <div className="relative z-10 text-center flex flex-col items-center gap-10 px-6 max-w-4xl">
        <div className={theme === "dark" ? "alternate-glow" : "light-glow"} />
        
        <div className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
          {/* Stabilized Title Container */}
          <div className="relative inline-block min-h-[1.1em]">
            <h1 className={`text-8xl md:text-[12rem] font-black tracking-tighter select-none leading-none transition-colors duration-500 ${theme === "light" ? "light-title" : "alternate-title"}`}>
              SKYE
            </h1>
            <span className={`absolute top-2 -right-8 text-2xl font-light opacity-40 transition-colors duration-500 ${theme === "light" ? "text-blue-700" : "text-blue-400"}`}>®</span>
          </div>
        </div>
        
        <div className="animate-fade-up opacity-0 h-[60px] flex items-center justify-center" style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}>
          {/* Stabilized Tagline */}
          <p className={`text-xl md:text-3xl font-bold tracking-[0.4em] uppercase max-w-3xl transition-colors duration-500 ${theme === "light" ? "text-slate-800" : "text-slate-300 opacity-80"}`}>
            Learning With AI
          </p>
        </div>

        {/* The Futuristic Primary CTA */}
        <div className="animate-fade-up opacity-0" style={{ animationDelay: "1s", animationFillMode: "forwards" }}>
          <FuturisticButton onClick={handleStartLearning} theme={theme}>
            Start Learning
          </FuturisticButton>
        </div>



        {/* Subtle refined accent */}
        <div className="mt-12 opacity-0 animate-fade-in" style={{ animationDelay: "1.5s", animationFillMode: "forwards" }}>
          <div className={`h-[1px] w-48 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent`} />
        </div>
      </div>

      {/* CSS Vignette */}
      <div className={`absolute inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.9)] ${theme === "dark" ? "opacity-40" : "opacity-10"}`} />

    </main>
  );
}


