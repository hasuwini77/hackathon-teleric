"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import ChatPanel from "@/components/chat-panel";
import { type UserProfile } from "@/components/profile-panel";
import LearningPath from "@/components/learning-path";
import { Brain } from "lucide-react";
import { useSpeech } from "@/hooks/use-speech";

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
    cvFile: null,
    linkedinUrl: "",
  });
  const { isSpeaking, speak } = useSpeech();
  const [isDigesting, setIsDigesting] = useState(false);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat */}
        <div className="flex-1 flex flex-col min-w-0">
          <ChatPanel profile={profile} onProfileChange={setProfile} speak={speak} />
        </div>

        {/* Right: 3D Avatar + Courses */}
        <aside className="hidden xl:flex flex-col w-96 border-l" style={{ borderColor: 'var(--color-border)' }}>
          {/* 3D Avatar */}
          <div className={`h-72 shrink-0 relative ${isSpeaking ? "animate-pulse-glow" : ""}`}>
            <AgentAvatar isSpeaking={isSpeaking} isDigesting={isDigesting} />
            {isSpeaking && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-full border"
                     style={{ backgroundColor: 'rgba(var(--primary-rgb), 0.1)', borderColor: 'rgba(var(--primary-rgb), 0.2)' }}>
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
                  <span className="text-xs ml-1" style={{ color: 'var(--color-primary)' }}>
                    Speaking
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Status indicator */}
          <div className="px-6 py-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full flex items-center justify-center border"
                   style={{ backgroundColor: 'rgba(var(--primary-rgb), 0.08)', borderColor: 'rgba(var(--primary-rgb), 0.2)' }}>
                <Brain className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)', lineHeight: '1.2' }}>
                  MentorAI Agent
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>
                  {isDigesting ? "Digesting information..." : isSpeaking ? "Speaking to you..." : "Ready to help"}
                </p>
              </div>
            </div>
          </div>

          {/* Learning Path */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <LearningPath />
          </div>
        </aside>
      </div>

    </div>
  );
}
