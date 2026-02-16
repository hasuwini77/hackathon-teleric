"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { LearningPathChat } from "@/components/agent-learning-path-chat";

export default function ChatPage() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="h-full overflow-y-auto bg-background p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center">
            <Image
              src={resolvedTheme === "dark" ? "/images/skye-logo-purple.png" : "/images/skye-logo.png"}
              alt="SKYE"
              width={64}
              height={64}
              className="w-16 h-auto"
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Learning Path Advisor
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Your AI-powered guide to building personalized learning roadmaps.
            Tell me about your goals and I'll help you create an actionable
            learning plan.
          </p>
        </div>

        {/* Chat Component */}
        <LearningPathChat />

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Powered by OpenRouter</p>
        </div>
      </div>
    </div>
  );
}
