"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Brain, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatPanel from "@/components/chat-panel";
import { TeacherStore, type TeacherSession } from "@/lib/teacher-store";
import type { UserProfile } from "@/components/profile-panel";
import { useSpeech } from "@/hooks/use-speech";
import { PromptConfigPanel } from "@/components/prompt-config-panel";

function TeachPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session");
  const [teacherSession, setTeacherSession] = useState<TeacherSession | null>(
    null,
  );
  const [profile, setProfile] = useState<UserProfile>({
    goals: "",
    experience: "",
    skills: [],
    linkedinSummary: "",
  });
  const { speak } = useSpeech();

  useEffect(() => {
    if (!sessionId) {
      router.push("/");
      return;
    }

    const session = TeacherStore.getOrCreateSession(sessionId);
    setTeacherSession(session);

    // Initialize profile from learning path data
    setProfile({
      goals: session.learningPath.objective || "",
      experience: session.learningPath.difficulty || "",
      skills: [],
      linkedinSummary: "",
    });
  }, [sessionId, router]);

  const handleProfileChange = (newProfile: UserProfile) => {
    setProfile(newProfile);
  };

  if (!teacherSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-muted-foreground">
          Loading your learning path...
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="border-b bg-card px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight">
                    {teacherSession.learningPath.title}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Interactive Learning Session
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Panel */}
        <div className="flex-1 overflow-hidden">
          <ChatPanel
            profile={profile}
            onProfileChange={handleProfileChange}
            speak={speak}
            learningPath={teacherSession.learningPath}
          />
        </div>
      </div>

      {/* Dev Prompt Config Panel */}
      <PromptConfigPanel />
    </main>
  );
}

export default function TeachPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-muted-foreground">
            Loading session...
          </div>
        </div>
      }
    >
      <TeachPageContent />
    </Suspense>
  );
}
