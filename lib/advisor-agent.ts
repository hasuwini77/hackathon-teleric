/**
 * Learning Path Agent - Client Side
 * Runs in the browser with localStorage persistence
 * Flow logic and orchestration
 */

import { AgentMemory, ChatMessage, AgentState } from "./advisor-state";
import { ActionData, ActionType, AgentActions } from "./advisor-actions";

// Re-export types for backward compatibility
export type { AgentMemory, ChatMessage, ActionData };
export { ActionType };

interface ExtractionData {
  objective: string | null;
  relevant_experience: string | null;
  background: string | null;
  skill_level: string | null;
  relevant_skills: string[];
  required_skills: string[];
  interests: string[];
  constraints: {
    time_per_week: string | null;
    deadline: string | null;
  };
  learning_path_detected: boolean;
}

interface OpenRouterMessage {
  content: string;
}

interface OpenRouterRequestBody {
  messages: ChatMessage[];
  temperature: number;
  max_tokens: number;
  response_format?: typeof EXTRACTION_SCHEMA;
}

const WELCOME_MESSAGE =
  "Hi! I'm here to help you create a personalized learning path. To get started, could you tell me a bit about yourself and what you're looking to learn?";

const EXTRACTION_SCHEMA = {
  type: "json_schema",
  json_schema: {
    name: "learning_profile",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        objective: { type: ["string", "null"] },
        relevant_experience: { type: ["string", "null"] },
        background: { type: ["string", "null"] },
        skill_level: { type: ["string", "null"] },
        relevant_skills: { type: "array", items: { type: "string" } },
        required_skills: { type: "array", items: { type: "string" } },
        interests: { type: "array", items: { type: "string" } },
        constraints: {
          type: "object",
          additionalProperties: false,
          properties: {
            time_per_week: { type: ["string", "null"] },
            deadline: { type: ["string", "null"] },
          },
          required: ["time_per_week", "deadline"],
        },
        learning_path_detected: { type: "boolean" },
      },
      required: [
        "objective",
        "relevant_experience",
        "background",
        "skill_level",
        "relevant_skills",
        "required_skills",
        "interests",
        "constraints",
        "learning_path_detected",
      ],
    },
  },
} as const;

export class LearningPathAgent {
  private state: AgentState;
  private actions: AgentActions;

  constructor(sessionId: string) {
    this.state = new AgentState(sessionId);
    this.actions = new AgentActions();

    // Try to load existing conversation from localStorage
    this.state.loadFromLocalStorage();

    // If no existing conversation, initialize with welcome message
    if (this.state.getMessages().length === 0) {
      this.state.addMessage({
        role: "system",
        content: this.getSystemPrompt(),
      });
      this.state.addMessage({ role: "assistant", content: WELCOME_MESSAGE });
    }
  }

  private getSystemPrompt(): string {
    const base = `You are an expert AI learning advisor that helps users build personalized learning paths.

Your conversation goal:
1. Understand what they want to achieve (objective)
2. Assess their current knowledge and experience
3. Understand constraints (time, budget, learning style)
4. Create a practical, actionable learning path

Guidelines:
- Be conversational and natural - don't follow a rigid script
- Ask follow-up questions when you need clarity for what they are missing to achieve their goal
- If they provide rich information upfront, don't ask redundant questions
- Move to creating the learning path when you have enough context
- The learning path should have 3-6 milestones with specific projects and resources
- Keep the questions to a minimum and only ask for missing information that is essential to creating the minimum learning path`;

    const contextParts = this.buildContextParts();
    const context =
      "\n\nCurrent context:\n" + contextParts.map((p) => `- ${p}`).join("\n");
    return base + context;
  }

  private buildContextParts(): string[] {
    const memory = this.state.getMemory();
    const parts: string[] = [];

    parts.push(
      memory.objective
        ? `Objective: ${memory.objective}`
        : "Still need: Clear learning objective",
    );
    parts.push(
      memory.relevant_experience
        ? `Experience: ${memory.relevant_experience}`
        : "Still need: Current skill level and experience",
    );

    if (memory.background) parts.push(`Background: ${memory.background}`);
    if (memory.skill_level) parts.push(`Skill Level: ${memory.skill_level}`);
    if (memory.interests.length > 0)
      parts.push(`Interests: ${memory.interests.join(", ")}`);
    if (memory.relevant_skills.length > 0)
      parts.push(
        `Skills User Already Has: ${memory.relevant_skills.join(", ")}`,
      );

    if (memory.required_skills.length > 0) {
      parts.push(
        `Required Skills to Learn: ${memory.required_skills.join(", ")}`,
        `IMPORTANT: Focus the learning path on the required skills. Do NOT include skills the user already has.`,
      );
    }

    if (memory.constraints.time_per_week || memory.constraints.deadline) {
      const constraints = [
        memory.constraints.time_per_week &&
          `Time: ${memory.constraints.time_per_week}`,
        memory.constraints.deadline &&
          `Deadline: ${memory.constraints.deadline}`,
      ].filter(Boolean);
      parts.push(`Constraints: ${constraints.join(", ")}`);
    }

    if (memory.learning_path_created) {
      parts.push("✓ Learning path has been created");
    } else {
      const missing = [
        !memory.objective && "learning objective",
        !memory.relevant_experience && "experience level",
      ].filter(Boolean);

      if (missing.length > 0) {
        parts.push(`Focus on understanding: ${missing.join(", ")}`);
      } else if (
        !memory.constraints.time_per_week &&
        !memory.constraints.deadline
      ) {
        parts.push("Consider asking about time availability or constraints");
      } else {
        parts.push("Ready to create learning path!");
      }
    }

    return parts;
  }

  private getExtractionMessages(
    userText: string,
    assistantText?: string,
  ): ChatMessage[] {
    const text = assistantText
      ? `${userText}\n\nAssistant response: ${assistantText}`
      : userText;

    return [
      {
        role: "system",
        content: `Extract structured information from the user's message.
Fill in any new information clearly stated or strongly implied.
Use null for missing strings, [] for empty arrays, {} for empty objects.

IMPORTANT - Skills extraction:
- relevant_skills: Skills the user ALREADY HAS or CURRENTLY KNOWS (e.g., "I know Python", "experienced in programming", "professional developer")
- required_skills: Skills the user NEEDS TO LEARN or wants to acquire (e.g., "want to learn ML", "need to understand RL", "looking to master AI")
- When extracting from experience/background, put known skills in relevant_skills
- When extracting from objectives/goals, put target skills in required_skills
- Be specific and granular with skill names

Set learning_path_detected to true if the assistant's response contains a structured learning path.`,
      },
      { role: "user", content: text },
    ];
  }

  private async extractAndUpdateMemory(
    userText: string,
    assistantText?: string,
  ): Promise<void> {
    try {
      const data = await this.callOpenRouter({
        messages: this.getExtractionMessages(userText, assistantText),
        response_format: EXTRACTION_SCHEMA,
        temperature: 0.0,
        max_tokens: 400,
      });

      this.updateMemoryFromExtraction(JSON.parse(data.content));
    } catch (error) {
      console.warn("Memory extraction failed:", error);
    }
  }

  private updateMemoryFromExtraction(data: ExtractionData): void {
    const memory = this.state.getMemory();

    // Update simple fields
    const simpleFields = [
      "objective",
      "relevant_experience",
      "background",
      "skill_level",
    ] as const;
    simpleFields.forEach((field) => {
      if (data[field] && !memory[field]) {
        memory[field] = data[field];
      }
    });

    // Update array fields
    const arrayFields = [
      "relevant_skills",
      "required_skills",
      "interests",
    ] as const;
    arrayFields.forEach((field) => {
      data[field]?.forEach((item: string) => {
        if (item && !memory[field].includes(item)) {
          memory[field].push(item);
        }
      });
    });

    // Update constraints
    if (data.constraints) {
      if (data.constraints.time_per_week) {
        memory.constraints.time_per_week = data.constraints.time_per_week;
      }
      if (data.constraints.deadline) {
        memory.constraints.deadline = data.constraints.deadline;
      }
    }

    if (data.learning_path_detected) {
      memory.learning_path_created = true;
    }
  }

  private async callOpenRouter(
    body: OpenRouterRequestBody,
  ): Promise<OpenRouterMessage> {
    const response = await fetch("/api/openrouter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", response.status, errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    if (!result.choices?.[0]?.message) {
      throw new Error("Invalid API response");
    }
    return result.choices[0].message;
  }

  async respond(userText: string): Promise<string> {
    this.state.addMessage({ role: "user", content: userText });
    this.state.updateSystemMessage(this.getSystemPrompt());

    const message = await this.callOpenRouter({
      messages: this.state.getMessages(),
      temperature: 0.7,
      max_tokens: 800,
    });
    const assistantText = message.content.trim();

    this.state.addMessage({ role: "assistant", content: assistantText });
    await this.extractAndUpdateMemory(userText, assistantText);
    this.actions.scheduleActions(
      this.state.getMemory(),
      this.state.getMessages(),
      this.state.getSessionId(),
    );
    this.state.saveToLocalStorage();

    return assistantText;
  }

  getMessages(): ChatMessage[] {
    return this.state.getMessages();
  }

  getMemory(): AgentMemory {
    return this.state.getMemory();
  }

  getPendingActions(): ActionData[] {
    return this.actions.getPendingActions();
  }

  clearPendingActions(): void {
    this.actions.clearPendingActions();
  }

  getInitialMessage(): string {
    const messages = this.state.getMessages();
    return messages.length > 1
      ? messages[messages.length - 1].content
      : WELCOME_MESSAGE;
  }

  static clearSession(sessionId: string): void {
    AgentState.clearSession(sessionId);
  }
}
