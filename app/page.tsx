"use client";

import { useState } from "react";
import ChatPanel from "@/components/chat-panel";
import { type UserProfile } from "@/components/profile-panel";
import LearningPath from "@/components/learning-path";
import { useSpeech } from "@/hooks/use-speech";

export default function Page() {
  const [profile, setProfile] = useState<UserProfile>({
    skills: [],
    experience: "",
    goals: "",
    linkedinSummary: "",
    cvFile: null,
    linkedinUrl: "",
  });
  const { speak } = useSpeech();

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat */}
        <div className="flex-1 flex flex-col min-w-0">
          <ChatPanel profile={profile} onProfileChange={setProfile} speak={speak} />
        </div>

        {/* Right: Courses */}
        <aside className="hidden xl:flex flex-col w-96 border-l" style={{ borderColor: 'var(--color-border)' }}>
          {/* Learning Path */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
            <LearningPath />
          </div>
        </aside>
      </div>

    </div>
  );
}
