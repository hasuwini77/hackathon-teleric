"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Send, User, Bot } from "lucide-react";
import {
  LearningPathAgent,
  type ChatMessage,
  type ActionData,
} from "@/lib/chat-agent";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function LearningPathChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [agent, setAgent] = useState<LearningPathAgent | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize agent on mount
  useEffect(() => {
    const initAgent = async () => {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);

      try {
        // API key is now handled server-side, just pass empty string
        const newAgent = new LearningPathAgent(
          newSessionId,
          "",
          "openai/gpt-4o-mini",
        );
        setAgent(newAgent);

        // Get initial messages from agent
        const agentMessages = newAgent.getMessages();
        setMessages(
          agentMessages
            .filter((m) => m.role !== "system")
            .map((m) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })),
        );
      } catch (error) {
        console.error("Failed to initialize agent:", error);
        setMessages([
          {
            role: "assistant",
            content:
              "Hi! I'm here to help you create a personalized learning path. To get started, could you tell me a bit about yourself and what you're looking to learn?",
          },
        ]);
      }
    };

    initAgent();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle pending actions when they're available
  const handlePendingActions = async (actions: ActionData[]) => {
    for (const action of actions) {
      if (action.type === "send_to_backend") {
        // Send learning path to backend for persistence
        try {
          await fetch("/api/learning-paths", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(action.data),
          });
        } catch (error) {
          console.error("Failed to save to backend:", error);
        }
      }
    }

    if (agent) {
      agent.clearPendingActions();
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
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
        { role: "assistant", content: response },
      ]);

      // Handle any pending actions
      const actions = agent.getPendingActions();
      if (actions.length > 0) {
        await handlePendingActions(actions);
      }
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

  const getMemoryStatus = () => {
    if (!agent) return "Initializing...";

    const memory = agent.getMemory();
    if (memory.learning_path_created) {
      return "Learning path created ✓";
    }

    const missing: string[] = [];
    if (!memory.objective) missing.push("objective");
    if (!memory.relevant_experience) missing.push("experience");

    if (missing.length === 0) {
      return "Ready to create path";
    }

    return `Gathering: ${missing.join(", ")}`;
  };

  return (
    <Card className="flex flex-col h-[600px] w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="border-b p-4">
        <h2 className="text-xl font-semibold">Learning Path Advisor</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {getMemoryStatus()}
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>

              {message.role === "user" && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-lg px-4 py-2 bg-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4">
        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
}
