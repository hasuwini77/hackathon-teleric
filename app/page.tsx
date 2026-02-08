"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import ChatPanel from "@/components/chat-panel";
import ProfilePanel, { type UserProfile } from "@/components/profile-panel";
import SuggestedCourses from "@/components/suggested-courses";
import { Brain } from "lucide-react";

const AgentAvatar = dynamic(() => import("@/components/agent-avatar"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-20 h-20 rounded-full bg-[var(--color-primary)]/10 animate-pulse" />
    </div>
  ),
});

export default function Page() {
  const [profile, setProfile] = useState<UserProfile>({
    skills: [],
    experience: "",
    goals: "",
    linkedinSummary: "",
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(true);

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between px-5 py-3 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ backgroundColor: 'rgba(20, 217, 245, 0.1)' }}>
              <Brain className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <h1 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}>
                MentorAI
              </h1>
              <p className="text-[11px]" style={{ color: 'var(--color-muted-foreground)' }}>
                Filter, update, and personalize learning fast
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] rounded-full border" 
                style={{ 
                  backgroundColor: 'rgba(20, 217, 245, 0.1)', 
                  color: 'var(--color-primary)',
                  borderColor: 'rgba(20, 217, 245, 0.2)'
                }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-primary)' }} />
            Online
          </span>
        </header>

        {/* Main content */}
        <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
          {/* Left: Profile panel */}
          <ProfilePanel
            profile={profile}
            onProfileChange={setProfile}
            isOpen={isProfileOpen}
            onToggle={() => setIsProfileOpen(!isProfileOpen)}
          />

          {/* Center: Chat */}
          <div className="flex-1 flex flex-col min-w-0 border-t lg:border-t-0" style={{ borderColor: 'var(--color-border)' }}>
            <ChatPanel profile={profile} onSpeakingChange={setIsSpeaking} />
          </div>

          {/* Right: 3D Avatar + Courses */}
          <aside className="hidden xl:flex flex-col w-96 border-l" style={{ borderColor: 'var(--color-border)' }}>
            {/* 3D Avatar */}
            <div className={`h-72 shrink-0 relative ${isSpeaking ? "animate-pulse-glow" : ""}`}>
              <AgentAvatar isSpeaking={isSpeaking} />
              {isSpeaking && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full border"
                       style={{ backgroundColor: 'rgba(20, 217, 245, 0.1)', borderColor: 'rgba(20, 217, 245, 0.2)' }}>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className="w-0.5 rounded-full animate-bounce"
                          style={{
                            height: `${8 + Math.random() * 10}px`,
                            animationDelay: `${i * 100}ms`,
                            animationDuration: "0.6s",
                            backgroundColor: 'var(--color-primary)'
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] ml-1.5" style={{ color: 'var(--color-primary)' }}>
                      Speaking
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Status indicator */}
            <div className="px-5 py-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center border"
                     style={{ backgroundColor: 'rgba(20, 217, 245, 0.1)', borderColor: 'rgba(20, 217, 245, 0.2)' }}>
                  <Brain className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}>
                    MentorAI Agent
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--color-muted-foreground)' }}>
                    {isSpeaking ? "Speaking to you..." : "Ready to help"}
                  </p>
                </div>
              </div>
            </div>

            {/* Suggested Courses */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-5 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <SuggestedCourses />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
