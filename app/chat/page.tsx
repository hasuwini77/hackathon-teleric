"use client";

import { Suspense } from "react";
import { LearningPathChat } from "@/components/agent-learning-path-chat";
import { Brain } from "lucide-react";
import { PromptConfigPanel } from "@/components/prompt-config-panel";

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Learning Path Advisor
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Your AI-powered guide to building personalized learning roadmaps.
            Tell me about your goals and I&apos;ll help you create an actionable
            learning plan.
          </p>
        </div>

        {/* Chat Component */}
        <Suspense
          fallback={
            <div className="text-center text-muted-foreground py-12">
              Loading session...
            </div>
          }
        >
          <LearningPathChat />
        </Suspense>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Powered by OpenRouter</p>
        </div>
      </div>

      {/* Dev Prompt Config Panel */}
      <PromptConfigPanel />
    </main>
  );
}
