"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Brain, Plus, ArrowRight, BookOpen, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SessionStore, type SessionSummary } from "@/lib/session-store";
import { TeacherStore, type TeacherSession } from "@/lib/teacher-store";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function SessionCard({
  session,
  onResume,
  onStartTeaching,
}: {
  session: SessionSummary;
  onResume: (id: string) => void;
  onStartTeaching?: (id: string) => void;
}) {
  return (
    <Card className="flex flex-col p-5 transition-colors hover:border-[var(--color-primary)]/30">
      <div className="flex items-center justify-between mb-3">
        <Badge
          variant={session.learningPathCreated ? "default" : "outline"}
          className="text-xs"
        >
          {session.learningPathCreated ? "Path Created" : "In Progress"}
        </Badge>
        <span
          className="text-xs"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          {formatDate(session.updatedAt)}
        </span>
      </div>

      <h3
        className="text-sm font-semibold mb-2 line-clamp-2"
        style={{ color: "var(--color-foreground)" }}
      >
        {session.objective || "New conversation"}
      </h3>

      {session.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {session.skills.slice(0, 4).map((skill, idx) => (
            <span
              key={idx}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: "rgba(139, 92, 246, 0.1)",
                color: "var(--color-primary)",
              }}
            >
              {skill}
            </span>
          ))}
          {session.skills.length > 4 && (
            <span
              className="text-xs px-2 py-0.5"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              +{session.skills.length - 4} more
            </span>
          )}
        </div>
      )}

      {session.skillLevel && (
        <p
          className="text-xs mb-3"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          Level: {session.skillLevel}
        </p>
      )}

      <div
        className="mt-auto pt-3 border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="flex gap-2">
          {session.learningPathCreated && onStartTeaching && (
            <Button
              size="sm"
              className="flex-1 gap-1 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onStartTeaching(session.sessionId);
              }}
            >
              <BookOpen className="h-3 w-3" />
              Start Course
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function Page() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [teacherSessions, setTeacherSessions] = useState<TeacherSession[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setSessions(SessionStore.getAllSessions());
    setTeacherSessions(TeacherStore.getAllSessions());
    setIsLoaded(true);
  }, []);

  const handleResume = (sessionId: string) => {
    router.push(`/chat?session=${sessionId}`);
  };

  const handleStartTeaching = (advisorSessionId: string) => {
    // Check if a teacher session already exists for this advisor session
    const existingTeacherSession = teacherSessions.find(
      (ts) => ts.learningPath.id === advisorSessionId,
    );

    if (existingTeacherSession) {
      router.push(`/teach?session=${existingTeacherSession.sessionId}`);
    } else {
      // Create a new teacher session
      // TODO: Get actual learning path from advisor session
      // For now, create a sample learning path
      const advisorSession = sessions.find(
        (s) => s.sessionId === advisorSessionId,
      );
      if (!advisorSession) return;

      const sampleLearningPath = {
        id: advisorSessionId,
        title: advisorSession.objective || "Learning Path",
        description: `Personalized learning path for: ${advisorSession.objective}`,
        objective: advisorSession.objective || "",
        difficulty: advisorSession.skillLevel || "intermediate",
        totalDuration: "12 weeks",
        prerequisites: [],
        milestones: [
          {
            id: "m1",
            title: "Foundation Phase",
            description: "Build your fundamental understanding",
            estimatedWeeks: 4,
            courses: [],
            outcomes: ["Understand core concepts", "Build basic projects"],
          },
        ],
        createdBy: "advisor" as const,
        createdAt: new Date().toISOString(),
      };

      const teacherSessionId = TeacherStore.createSession(sampleLearningPath);
      router.push(`/teach?session=${teacherSessionId}`);
    }
  };

  const handleNewSession = () => {
    const newId = SessionStore.generateSessionId();
    router.push(`/chat?session=${newId}`);
  };

  const sessionsWithPaths = sessions.filter((s) => s.learningPathCreated);
  const sessionsInProgress = sessions.filter(
    (s) => !s.learningPathCreated && s.objective,
  );

  return (
    <main className="min-h-screen p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div
            className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-2xl"
            style={{ backgroundColor: "rgba(139, 92, 246, 0.1)" }}
          >
            <Brain
              className="h-8 w-8"
              style={{ color: "var(--color-primary)" }}
            />
          </div>
          <h1
            className="text-4xl font-bold tracking-tight mb-2"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-foreground)",
            }}
          >
            MentorAI
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            Your AI-powered guide to personalized learning paths
          </p>
        </div>

        {/* New Session CTA */}
        <div className="mb-10 flex justify-center">
          <Button onClick={handleNewSession} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Start New Learning Path
          </Button>
        </div>

        {/* Completed learning paths */}
        {sessionsWithPaths.length > 0 && (
          <section className="mb-10">
            <h2
              className="text-xl font-semibold mb-4 flex items-center gap-2"
              style={{ color: "var(--color-foreground)" }}
            >
              <BookOpen
                className="h-5 w-5"
                style={{ color: "var(--color-primary)" }}
              />
              Your Learning Paths
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessionsWithPaths.map((session) => (
                <SessionCard
                  key={session.sessionId}
                  session={session}
                  onResume={handleResume}
                  onStartTeaching={handleStartTeaching}
                />
              ))}
            </div>
          </section>
        )}

        {/* In-progress sessions */}
        {sessionsInProgress.length > 0 && (
          <section className="mb-10">
            <h2
              className="text-xl font-semibold mb-4 flex items-center gap-2"
              style={{ color: "var(--color-foreground)" }}
            >
              <Clock
                className="h-5 w-5"
                style={{ color: "var(--color-primary)" }}
              />
              In Progress
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessionsInProgress.map((session) => (
                <SessionCard
                  key={session.sessionId}
                  session={session}
                  onResume={handleResume}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {isLoaded && sessions.length === 0 && (
          <div
            className="text-center py-20"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            <p className="text-lg mb-2">No learning paths yet</p>
            <p className="text-sm">
              Click &quot;Start New Learning Path&quot; to begin your journey
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
