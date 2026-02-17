"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import ChatPanel from "@/components/chat-panel";
import { Brain } from "lucide-react";
import { useSpeech } from "@/hooks/use-speech";
import { LearningPath } from "@/lib/learning-path-types";

// Static learning path for the teacher agent
const SAMPLE_LEARNING_PATH: LearningPath = {
  id: "react-server-components",
  title: "React Server Components",
  description:
    "Learn to build efficient React applications with Server Components",
  objective: "Master React Server Components and modern React patterns",
  difficulty: "Intermediate",
  totalDuration: "8 weeks",
  prerequisites: ["React basics", "JavaScript ES6+"],
  createdBy: "curated",
  createdAt: new Date().toISOString(),
  milestones: [
    {
      id: "milestone-1",
      title: "React Fundamentals",
      description: "Master core React concepts and hooks",
      estimatedWeeks: 3,
      outcomes: [
        "Understand components and props",
        "Master useState and useEffect",
        "Build interactive UIs",
      ],
      courses: [
        {
          id: "course-1-1",
          title: "React Components & JSX",
          provider: "Official React Docs",
          url: "https://react.dev",
          duration: "2 hours",
          type: "documentation",
          description: "Learn how to create and compose React components",
        },
        {
          id: "course-1-2",
          title: "React Hooks Deep Dive",
          provider: "React Documentation",
          url: "https://react.dev/reference/react",
          duration: "3 hours",
          type: "documentation",
          description: "Master useState, useEffect, and other essential hooks",
        },
      ],
    },
    {
      id: "milestone-2",
      title: "State Management",
      description: "Learn modern state management patterns",
      estimatedWeeks: 2,
      outcomes: [
        "Manage complex application state",
        "Use Context API effectively",
        "Understand state management libraries",
      ],
      courses: [
        {
          id: "course-2-1",
          title: "React Context API",
          provider: "React Docs",
          url: "https://react.dev/learn/passing-data-deeply-with-context",
          duration: "2 hours",
          type: "documentation",
          description: "Share state across components without prop drilling",
        },
      ],
    },
    {
      id: "milestone-3",
      title: "Next.js & Full-Stack",
      description: "Build full-stack applications with Next.js",
      estimatedWeeks: 4,
      outcomes: [
        "Build server-side rendered apps",
        "Create API routes",
        "Deploy to production",
      ],
      courses: [
        {
          id: "course-3-1",
          title: "Next.js App Router",
          provider: "Next.js",
          url: "https://nextjs.org/docs",
          duration: "4 hours",
          type: "documentation",
          description: "Learn the modern Next.js App Router",
        },
      ],
    },
  ],
};

const AgentAvatar = dynamic(() => import("@/components/agent-avatar"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-20 h-20 rounded-full bg-[var(--color-primary)]/10 animate-pulse" />
    </div>
  ),
});

export default function Page() {
  const { isSpeaking, speak } = useSpeech();
  const [isDigesting, setIsDigesting] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Auto-start the teacher agent with the first lesson
  useEffect(() => {
    if (!hasStarted) {
      setHasStarted(true);
      // Small delay to let the UI render first
      setTimeout(() => {
        speak(
          "Welcome! Let's start learning React Server Components. I'll guide you through this course step by step.",
        );
      }, 500);
    }
  }, [hasStarted, speak]);

  return (
    <main
      className="h-screen overflow-hidden"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div className="mx-auto flex h-full max-w-[1400px] flex-col">
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-6 py-5 border-b shrink-0"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl"
              style={{ backgroundColor: "rgba(139, 92, 246, 0.1)" }}
            >
              <Brain
                className="h-5 w-5"
                style={{ color: "var(--color-primary)" }}
              />
            </div>
            <div>
              <h1
                className="text-base font-bold tracking-tight"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-foreground)",
                  lineHeight: "1.2",
                }}
              >
                MentorAI Teacher
              </h1>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                {SAMPLE_LEARNING_PATH.title}
              </p>
            </div>
          </div>
          <span
            className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-full border"
            style={{
              backgroundColor: "rgba(139, 92, 246, 0.08)",
              color: "var(--color-primary)",
              borderColor: "rgba(139, 92, 246, 0.2)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: "var(--color-primary)" }}
            />
            Teaching Mode
          </span>
        </header>

        {/* Main content */}
        <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
          {/* Center: Chat */}
          <div className="flex-1 flex flex-col min-w-0">
            <ChatPanel
              profile={{
                skills: [],
                experience: "",
                goals: "",
                linkedinSummary: "",
                cvFile: null,
                linkedinUrl: "",
              }}
              onProfileChange={() => {}}
              speak={speak}
              learningPath={SAMPLE_LEARNING_PATH}
            />
          </div>

          {/* Right: 3D Avatar + Courses */}
          <aside
            className="hidden xl:flex flex-col w-96 border-l"
            style={{ borderColor: "var(--color-border)" }}
          >
            {/* 3D Avatar */}
            <div
              className={`h-72 shrink-0 relative ${isSpeaking ? "animate-pulse-glow" : ""}`}
            >
              <AgentAvatar isSpeaking={isSpeaking} isDigesting={isDigesting} />
              {isSpeaking && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                  <div
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full border"
                    style={{
                      backgroundColor: "rgba(139, 92, 246, 0.1)",
                      borderColor: "rgba(139, 92, 246, 0.2)",
                    }}
                  >
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className="w-0.5 rounded-full animate-bounce"
                          style={{
                            height: `${8 + Math.random() * 10}px`,
                            animationDelay: `${i * 100}ms`,
                            animationDuration: "0.6s",
                            backgroundColor: "var(--color-primary)",
                          }}
                        />
                      ))}
                    </div>
                    <span
                      className="text-xs ml-1"
                      style={{ color: "var(--color-primary)" }}
                    >
                      Speaking
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Status indicator */}
            <div
              className="px-6 py-4 border-t"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center border"
                  style={{
                    backgroundColor: "rgba(139, 92, 246, 0.08)",
                    borderColor: "rgba(139, 92, 246, 0.2)",
                  }}
                >
                  <Brain
                    className="h-5 w-5"
                    style={{ color: "var(--color-primary)" }}
                  />
                </div>
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--color-foreground)",
                      lineHeight: "1.2",
                    }}
                  >
                    MentorAI Agent
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    {isDigesting
                      ? "Digesting information..."
                      : isSpeaking
                        ? "Speaking to you..."
                        : "Ready to help"}
                  </p>
                </div>
              </div>
            </div>

            {/* Learning Path */}
            <div
              className="flex-1 overflow-y-auto scrollbar-thin p-6 border-t"
              style={{ borderColor: "var(--color-border)" }}
            >
              <h3
                className="text-sm font-semibold mb-4"
                style={{ color: "var(--color-foreground)" }}
              >
                Learning Path
              </h3>
              <div
                className="space-y-2 text-xs"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                {SAMPLE_LEARNING_PATH.milestones.map((milestone, idx) => (
                  <div
                    key={milestone.id}
                    className="p-3 rounded-lg border"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <div
                      className="font-medium"
                      style={{ color: "var(--color-foreground)" }}
                    >
                      {idx + 1}. {milestone.title}
                    </div>
                    <div className="mt-1">{milestone.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
