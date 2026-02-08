"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import type { UserProfile } from "./profile-panel";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  profile: UserProfile;
  onSpeakingChange: (isSpeaking: boolean) => void;
}

export default function ChatPanel({ profile, onSpeakingChange }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your MentorAI. Tell me about your learning goals and I'll help you create a personalized path! 🚀",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    onSpeakingChange(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse: Message = {
        role: "assistant",
        content: `Great question! Based on your profile (${profile.skills.join(", ") || "no skills yet"}), here's what I recommend...`,
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
      onSpeakingChange(false);
    }, 1500);
  };

  const quickPrompts = [
    "Analyze my skill gaps",
    "Build a 6-month learning plan",
    "Suggest top 3 courses",
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "text-white"
                  : "border"
              }`}
              style={
                msg.role === "user"
                  ? { backgroundColor: "var(--color-primary)" }
                  : {
                      backgroundColor: "var(--color-card)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-foreground)",
                    }
              }
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div
              className="max-w-[80%] rounded-2xl px-4 py-3 border flex gap-2"
              style={{
                backgroundColor: "var(--color-card)",
                borderColor: "var(--color-border)",
              }}
            >
              <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "var(--color-primary)", animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "var(--color-primary)", animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "var(--color-primary)", animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <div className="flex gap-2 flex-wrap">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInput(prompt)}
                className="px-3 py-1.5 text-xs rounded-full border transition-all hover:scale-105"
                style={{
                  backgroundColor: "var(--color-secondary)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-foreground)",
                }}
              >
                <Sparkles className="inline w-3 h-3 mr-1" />
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your learning path..."
            className="flex-1 px-4 py-3 rounded-xl border outline-none focus:ring-2 transition-all"
            style={{
              backgroundColor: "var(--color-card)",
              borderColor: "var(--color-border)",
              color: "var(--color-foreground)",
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-primary-foreground)",
            }}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
