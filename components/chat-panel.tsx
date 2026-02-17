"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  XCircle,
  Target,
  Briefcase,
} from "lucide-react";
import type { UserProfile } from "./profile-panel";
import type { LearningPath } from "@/lib/learning-path-types";
import {
  TeacherAgent,
  type AgentResponse,
  type LessonWithQuizResponse,
  type TextResponse,
} from "@/lib/teacher-agent";

interface Message {
  role: "user" | "assistant";
  content: string;
  response?: AgentResponse;
  selectedAnswer?: string;
  showResult?: boolean;
  isCorrect?: boolean;
}

interface ChatPanelProps {
  profile: UserProfile;
  onProfileChange: (profile: UserProfile) => void;
  speak: (text: string) => void;
  learningPath?: LearningPath;
  sessionId?: string;
}

export default function ChatPanel({
  profile,
  onProfileChange,
  speak,
  learningPath,
  sessionId,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agent, setAgent] = useState<TeacherAgent | null>(null);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Initialize teacher agent
  useEffect(() => {
    const agentSessionId = sessionId ?? `teacher_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newAgent = new TeacherAgent(agentSessionId, learningPath);
    setAgent(newAgent);

    // Load initial messages
    const agentMessages = newAgent.getMessages();
    setMessages(
      agentMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    );
  }, [learningPath]);

  // Auto-start the first lesson
  useEffect(() => {
    const autoStartLesson = async () => {
      if (!agent || hasAutoStarted || messages.length > 0 || isLoading) return;

      setHasAutoStarted(true);
      setIsLoading(true);

      try {
        const response = await agent.respond(
          "Start teaching me the first lesson",
        );

        setMessages([
          { role: "assistant", content: response.content, response },
        ]);

        // Speak the welcome message
        speak(response.content);
      } catch (error) {
        console.error("Error auto-starting lesson:", error);
      } finally {
        setIsLoading(false);
      }
    };

    autoStartLesson();
  }, [agent, hasAutoStarted, messages.length, isLoading, speak]);

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !agent) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await agent.respond(userMessage);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.content, response },
      ]);

      // Speak the response
      speak(response.content);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerCheck = (messageIndex: number, answer: string) => {
    const message = messages[messageIndex];
    if (!message.response || message.response.type !== "lesson") return;

    const lesson = message.response as LessonWithQuizResponse;
    const isCorrect = answer === lesson.question.correctAnswer;

    setMessages((prev) =>
      prev.map((msg, idx) =>
        idx === messageIndex
          ? {
              ...msg,
              selectedAnswer: answer,
              showResult: true,
              isCorrect,
            }
          : msg,
      ),
    );
  };

  const renderResponse = (
    response?: AgentResponse,
    messageIndex?: number,
    selectedAnswer?: string,
    showResult?: boolean,
    isCorrect?: boolean,
  ) => {
    if (!response) return null;

    switch (response.type) {
      case "text":
        return null; // Text response shows only in content

      case "lesson":
        const lesson = response as LessonWithQuizResponse;
        return (
          <div className="mt-3 space-y-3">
            {/* Examples */}
            {lesson.examples.length > 0 && (
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  Examples:
                </p>
                {lesson.examples.map((ex, idx) => (
                  <p key={idx} className="text-xs ml-5 mt-1">
                    • {ex}
                  </p>
                ))}
              </div>
            )}

            {/* Key Takeaways */}
            {lesson.keyTakeaways.length > 0 && (
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Key Takeaways:
                </p>
                {lesson.keyTakeaways.map((takeaway, idx) => (
                  <p key={idx} className="text-xs ml-5 mt-1">
                    ✓ {takeaway}
                  </p>
                ))}
              </div>
            )}

            {/* Quiz Question */}
            <div
              className="p-4 rounded-lg border"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-card)",
              }}
            >
              <p className="text-xs font-semibold mb-3 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" />
                Test Your Understanding:
              </p>
              <p className="text-sm font-medium mb-3">
                {lesson.question.question}
              </p>

              <div className="space-y-2">
                {lesson.question.options.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrectAnswer =
                    option === lesson.question.correctAnswer;

                  return (
                    <button
                      key={idx}
                      onClick={() =>
                        messageIndex !== undefined &&
                        !showResult &&
                        handleAnswerCheck(messageIndex, option)
                      }
                      disabled={showResult}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        showResult
                          ? isCorrectAnswer
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                            : isSelected
                              ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                              : "border-gray-200 dark:border-gray-700"
                          : isSelected
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        <span className="text-sm flex-1">{option}</span>
                        {showResult && isCorrectAnswer && (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        )}
                        {showResult && isSelected && !isCorrectAnswer && (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {showResult && (
                <div
                  className={`mt-3 p-3 rounded-lg ${
                    isCorrect
                      ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                      : "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                  }`}
                >
                  <p className="text-xs font-semibold mb-1">
                    {isCorrect ? "✓ Correct!" : "Not quite..."}
                  </p>
                  <p className="text-xs">{lesson.question.explanation}</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
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
            <div
              className="relative p-6 rounded-2xl border bg-[var(--color-card)]/50 backdrop-blur-sm"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[var(--color-primary)]/10">
                    <Target className="w-5 h-5 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <h3
                      className="text-sm font-bold tracking-tight"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: "var(--color-foreground)",
                      }}
                    >
                      Your Learning Mission
                    </h3>
                    <p
                      className="text-[10px]"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      What fuels your growth today?
                    </p>
                  </div>
                </div>

                {/* Experience Selector Inlined */}
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-[var(--color-background)]/50"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <Briefcase className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  <select
                    value={profile.experience}
                    onChange={(e) =>
                      onProfileChange({
                        ...profile,
                        experience: e.target.value,
                      })
                    }
                    className="bg-transparent text-xs font-semibold outline-none cursor-pointer pr-1"
                    style={{ color: "var(--color-foreground)" }}
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
                onChange={(e) =>
                  onProfileChange({ ...profile, goals: e.target.value })
                }
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
                  msg.role === "user" ? "text-white" : "border"
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
                {msg.role === "assistant" &&
                  renderResponse(
                    msg.response,
                    idx,
                    msg.selectedAnswer,
                    msg.showResult,
                    msg.isCorrect,
                  )}
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
                <span
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    animationDelay: "0ms",
                  }}
                />
                <span
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    animationDelay: "150ms",
                  }}
                />
                <span
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    animationDelay: "300ms",
                  }}
                />
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
      <form
        onSubmit={handleSubmit}
        className="p-6 border-t bg-[var(--color-background)]"
        style={{ borderColor: "var(--color-border)" }}
      >
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
