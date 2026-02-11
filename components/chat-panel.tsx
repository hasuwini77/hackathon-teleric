"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Target, Briefcase } from "lucide-react";
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
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">
        {/* Centered Learning Mission */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative p-6 rounded-2xl border bg-[var(--color-card)]/50 backdrop-blur-sm" style={{ borderColor: "var(--color-border)" }}>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-[var(--color-primary)]/10">
                      <Target className="w-5 h-5 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold tracking-tight" style={{ fontFamily: "var(--font-display)", color: "var(--color-foreground)" }}>
                        Your Learning Mission
                      </h3>
                      <p className="text-[10px]" style={{ color: "var(--color-muted-foreground)" }}>
                        What fuels your growth today?
                      </p>
                    </div>
                  </div>
                  
                  {/* Experience Selector Inlined */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-[var(--color-background)]/50" style={{ borderColor: 'var(--color-border)' }}>
                    <Briefcase className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                    <select
                      value={profile.experience}
                      onChange={(e) => onProfileChange({ ...profile, experience: e.target.value })}
                      className="bg-transparent text-xs font-semibold outline-none cursor-pointer pr-1"
                      style={{ color: 'var(--color-foreground)' }}
                    >
                      <option value="">Level...</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                </div>
              <textarea
                value={profile.goals}
                onChange={(e) => onProfileChange({ ...profile, goals: e.target.value })}
                placeholder="Ex: I want to master React and become a Senior Frontend Engineer..."
                rows={3}
                className="w-full bg-transparent text-sm outline-none resize-none placeholder:text-[var(--color-muted-foreground)]/50 transition-all"
                style={{
                  color: "var(--color-foreground)",
                  lineHeight: "1.6",
                }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
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
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="px-6 pb-4">
          <div className="flex gap-2 flex-wrap justify-center">
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
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-6 border-t bg-[var(--color-background)]" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your learning path..."
            className="flex-1 px-4 py-3 text-sm rounded-xl border outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
            style={{
              backgroundColor: "var(--color-card)",
              borderColor: "var(--color-border)",
              color: "var(--color-foreground)",
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center"
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
