"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, ArrowUp } from "lucide-react";
import type { UserProfile } from "./profile-panel";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  profile: UserProfile;
  onProfileChange: (profile: UserProfile) => void;
  speak: (text: string) => void;
}

export default function ChatPanel({ profile, onProfileChange, speak }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your MentorAI. Tell me about your learning goals and I'll help you create a personalized path!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasUserMessages = messages.some((m) => m.role === "user");

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

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const responseText = `Great question! Based on your profile (${profile.skills.join(", ") || "no skills yet"}), here's what I recommend...`;
      const aiResponse: Message = {
        role: "assistant",
        content: responseText,
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
      speak(responseText);
    }, 1500);
  };

  const quickPrompts = [
    "Analyze my skill gaps",
    "Build a 6-month learning plan",
    "Suggest top 3 courses",
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        {/* Empty state: center the input */}
        {!hasUserMessages && (
          <div className="flex flex-col items-center justify-center h-full">
            {/* Assistant greeting */}
            <p className="text-muted-foreground text-center mb-8 max-w-md">
              {messages[0]?.content}
            </p>

            {/* Quick Actions */}
            <div className="flex gap-2 flex-wrap justify-center mb-6">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="px-4 py-2 text-xs rounded-full border transition-all hover:scale-105 bg-[var(--color-background)] hover:bg-[var(--color-secondary)]"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-foreground)",
                  }}
                >
                  <Sparkles className="inline w-3 h-3 mr-2 text-[var(--color-primary)]" />
                  {prompt}
                </button>
              ))}
            </div>

            {/* Centered large input */}
            <form onSubmit={handleSubmit} className="w-full max-w-xl">
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
                  placeholder="Ask me anything about your learning path..."
                  rows={4}
                  className="w-full px-6 py-5 pr-14 text-base rounded-3xl border outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all shadow-lg resize-none"
                  style={{
                    backgroundColor: "var(--color-card)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-foreground)",
                  }}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-3 bottom-3 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-primary-foreground)",
                  }}
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Chat messages (only after user sends first message) */}
        {hasUserMessages && (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-[80%] rounded-2xl px-4 py-3"
                  style={
                    msg.role === "user"
                      ? { backgroundColor: "var(--color-primary)", color: "white" }
                      : { color: "var(--color-foreground)" }
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl px-4 py-3 flex items-end gap-1.5">
                  <span className="text-[8px] text-muted-foreground/50 uppercase" style={{ fontFamily: "var(--font-pixel), 'Press Start 2P', cursive" }}>thinking</span>
                  <div className="flex gap-[2px] mb-[3px]">
                    <span className="w-1.5 h-1.5 rounded-none pixel-bounce-1" style={{ backgroundColor: "var(--color-primary)" }} />
                    <span className="w-1.5 h-1.5 rounded-none pixel-bounce-2" style={{ backgroundColor: "var(--color-accent)" }} />
                    <span className="w-1.5 h-1.5 rounded-none pixel-bounce-3" style={{ backgroundColor: "var(--color-primary-hover, var(--color-primary))" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom input (only shown after conversation starts) */}
      {hasUserMessages && (
        <div className="px-6 pb-6 pt-3">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your learning path..."
                className="w-full px-5 py-3 pr-12 text-sm rounded-full border outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                style={{
                  backgroundColor: "var(--color-card)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-foreground)",
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-primary-foreground)",
                }}
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
