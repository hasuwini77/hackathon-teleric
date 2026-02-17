"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StylishBackground from "@/components/landing/StylishBackground";
import CustomCursor from "@/components/landing/CustomCursor";
import FuturisticButton from "@/components/landing/FuturisticButton";
import ThemeToggle from "@/components/landing/ThemeToggle";
import { SessionStore, type SessionSummary } from "@/lib/session-store";
import FuturisticSessionCard from "@/components/landing/FuturisticSessionCard";
import "./landing1/landing.css";

export default function Page() {
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load existing sessions from store
    setSessions(SessionStore.getAllSessions());
    setIsLoaded(true);
  }, []);

  const handleStartLearning = () => {
    const newId = SessionStore.generateSessionId();
    router.push(`/chat?session=${newId}`);
  };

  const handleResumeSession = (id: string) => {
    router.push(`/teach?session=${id}`);
  };

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <main
      className={`relative min-h-screen w-full overflow-y-auto overflow-x-hidden cursor-none transition-colors duration-1000 ${theme === "dark" ? "bg-black" : "bg-white"} scrollbar-hide`}
    >
      {/* Custom Cursor */}
      <CustomCursor />

      {/* 3D Interactive Background - Fixed to background */}
      <div className="fixed inset-0 z-0">
        <StylishBackground theme={theme} />
      </div>

      {/* Theme Switcher */}
      <ThemeToggle isDark={theme === "dark"} onToggle={toggleTheme} />

      {/* Immersive Overlay */}
      <div
        className={`fixed inset-0 pointer-events-none z-0 ${theme === "dark" ? "bg-gradient-to-b from-transparent via-transparent to-slate-950/40" : "bg-gradient-to-b from-transparent to-blue-50/20"}`}
      />

      {/* Hero + Cards unified section */}
      <div className="relative z-10 min-h-screen w-full flex flex-col items-center justify-center py-20">
        {/* Hero Content */}
        <div className="text-center flex flex-col items-center gap-10 px-6 max-w-4xl w-full">
          <div className={theme === "dark" ? "alternate-glow" : "light-glow"} />

          <div className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="relative inline-block min-h-[1.1em]">
              <h1
                className={`text-8xl md:text-[12rem] font-black tracking-tighter select-none leading-none transition-colors duration-500 ${theme === "light" ? "light-title" : "alternate-title"}`}
              >
                SKYE
              </h1>
              <span
                className={`absolute top-2 -right-8 text-2xl font-light opacity-40 transition-colors duration-500 ${theme === "light" ? "text-blue-700" : "text-blue-400"}`}
              >
                ®
              </span>
            </div>
          </div>

          <div
            className="animate-fade-up opacity-0 h-[60px] flex items-center justify-center"
            style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}
          >
            <p
              className={`text-xl md:text-3xl font-bold tracking-[0.4em] uppercase max-w-3xl transition-colors duration-500 ${theme === "light" ? "text-slate-800" : "text-slate-300 opacity-80"}`}
            >
              Learning With AI
            </p>
          </div>

          <div
            className="animate-fade-up opacity-0"
            style={{ animationDelay: "1s", animationFillMode: "forwards" }}
          >
            <FuturisticButton onClick={handleStartLearning} theme={theme}>
              Start Learning
            </FuturisticButton>
          </div>
        </div>

        {/* Session cards — directly below the button, no header */}
        {isLoaded && sessions.length > 0 && (
          <div className="w-full max-w-5xl mx-auto px-6 mt-16 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sessions.map((session) => (
                <FuturisticSessionCard
                  key={session.sessionId}
                  session={session}
                  theme={theme}
                  onClick={handleResumeSession}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CSS Vignette */}
      <div
        className={`fixed inset-0 pointer-events-none z-20 shadow-[inset_0_0_200px_rgba(0,0,0,0.9)] ${theme === "dark" ? "opacity-40" : "opacity-10"}`}
      />
    </main>
  );
}
