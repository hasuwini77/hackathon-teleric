/**
 * Learning Path Agent - Client Side
 * Runs in the browser with localStorage persistence
 */

export interface AgentMemory {
  objective: string | null;
  relevant_experience: string | null;
  background: string | null;
  skill_level: string | null;
  relevant_skills: string[];
  required_skills: string[];
  constraints: {
    time_per_week: string | null;
    deadline: string | null;
  };
  interests: string[];
  learning_path_created: boolean;
  scheduled_actions: string[];
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ActionData {
  type: string;
  data: Record<string, any>;
}

export class ActionType {
  static readonly SAVE_LEARNING_PATH = "save_learning_path";
  static readonly SEARCH_WEB = "search_web";
  static readonly SEND_TO_BACKEND = "send_to_backend";
}

export class LearningPathAgent {
  private sessionId: string;
  private memory: AgentMemory;
  private chatMessages: ChatMessage[];
  private pendingActions: ActionData[];

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.memory = this.initMemory();
    this.chatMessages = [];
    this.pendingActions = [];

    // Try to load existing conversation from localStorage
    this.loadFromLocalStorage();

    // If no existing conversation, initialize with welcome message
    if (this.chatMessages.length === 0) {
      this.chatMessages = [
        { role: "system", content: this.getSystemPrompt() },
        {
          role: "assistant",
          content:
            "Hi! I'm here to help you create a personalized learning path. To get started, could you tell me a bit about yourself and what you're looking to learn?",
        },
      ];
    }
  }

  private initMemory(): AgentMemory {
    return {
      objective: null,
      relevant_experience: null,
      background: null,
      skill_level: null,
      relevant_skills: [],
      required_skills: [],
      constraints: {
        time_per_week: null,
        deadline: null,
      },
      interests: [],
      learning_path_created: false,
      scheduled_actions: [],
    };
  }

  private getStorageKey(suffix: string): string {
    return `learning_agent_${this.sessionId}_${suffix}`;
  }

  private loadFromLocalStorage(): void {
    try {
      const memoryJson = localStorage.getItem(this.getStorageKey("memory"));
      const messagesJson = localStorage.getItem(this.getStorageKey("messages"));

      if (memoryJson) {
        this.memory = JSON.parse(memoryJson);
      }

      if (messagesJson) {
        this.chatMessages = JSON.parse(messagesJson);
        // Refresh system prompt
        if (this.chatMessages[0]?.role === "system") {
          this.chatMessages[0].content = this.getSystemPrompt();
        }
      }
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
    }
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem(
        this.getStorageKey("memory"),
        JSON.stringify(this.memory),
      );
      localStorage.setItem(
        this.getStorageKey("messages"),
        JSON.stringify(this.chatMessages),
      );
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
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

    // Dynamic context based on what we know
    const contextParts: string[] = [];

    if (this.memory.objective) {
      contextParts.push(`Objective: ${this.memory.objective}`);
    } else {
      contextParts.push("Still need: Clear learning objective");
    }

    if (this.memory.relevant_experience) {
      contextParts.push(`Experience: ${this.memory.relevant_experience}`);
    } else {
      contextParts.push("Still need: Current skill level and experience");
    }

    if (this.memory.background) {
      contextParts.push(`Background: ${this.memory.background}`);
    }

    if (this.memory.skill_level) {
      contextParts.push(`Skill Level: ${this.memory.skill_level}`);
    }

    if (this.memory.interests.length > 0) {
      contextParts.push(`Interests: ${this.memory.interests.join(", ")}`);
    }

    if (this.memory.relevant_skills.length > 0) {
      contextParts.push(
        `Skills User Already Has: ${this.memory.relevant_skills.join(", ")}`,
      );
    }

    if (this.memory.required_skills.length > 0) {
      contextParts.push(
        `Required Skills to Learn: ${this.memory.required_skills.join(", ")}`,
      );
      contextParts.push(
        `IMPORTANT: Focus the learning path on the required skills. Do NOT include skills the user already has.`,
      );
    }

    if (
      this.memory.constraints.time_per_week ||
      this.memory.constraints.deadline
    ) {
      const constraintParts = [];
      if (this.memory.constraints.time_per_week) {
        constraintParts.push(`Time: ${this.memory.constraints.time_per_week}`);
      }
      if (this.memory.constraints.deadline) {
        constraintParts.push(`Deadline: ${this.memory.constraints.deadline}`);
      }
      contextParts.push(`Constraints: ${constraintParts.join(", ")}`);
    }

    if (this.memory.learning_path_created) {
      contextParts.push("✓ Learning path has been created");
    } else {
      const missing: string[] = [];
      if (!this.memory.objective) missing.push("learning objective");
      if (!this.memory.relevant_experience) missing.push("experience level");

      if (missing.length > 0) {
        contextParts.push(`Focus on understanding: ${missing.join(", ")}`);
      } else if (
        !this.memory.constraints.time_per_week &&
        !this.memory.constraints.deadline
      ) {
        contextParts.push(
          "Consider asking about time availability or constraints",
        );
      } else {
        contextParts.push("Ready to create learning path!");
      }
    }

    const context =
      "\n\nCurrent context:\n" + contextParts.map((p) => `- ${p}`).join("\n");
    return base + context;
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
      const response = await fetch("/api/openrouter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: this.getExtractionMessages(userText, assistantText),
          response_format: {
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
          },
          temperature: 0.0,
          max_tokens: 400,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenRouter API error:", response.status, errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      if (!result.choices || !result.choices[0] || !result.choices[0].message) {
        throw new Error("Invalid API response");
      }
      const data = JSON.parse(result.choices[0].message.content);

      // Update memory with extracted data
      if (data.objective && !this.memory.objective) {
        this.memory.objective = data.objective;
      }
      if (data.relevant_experience && !this.memory.relevant_experience) {
        this.memory.relevant_experience = data.relevant_experience;
      }
      if (data.background && !this.memory.background) {
        this.memory.background = data.background;
      }
      if (data.skill_level && !this.memory.skill_level) {
        this.memory.skill_level = data.skill_level;
      }
      if (data.relevant_skills) {
        data.relevant_skills.forEach((skill: string) => {
          if (skill && !this.memory.relevant_skills.includes(skill)) {
            this.memory.relevant_skills.push(skill);
          }
        });
      }
      if (data.required_skills) {
        data.required_skills.forEach((skill: string) => {
          if (skill && !this.memory.required_skills.includes(skill)) {
            this.memory.required_skills.push(skill);
          }
        });
      }
      if (data.interests) {
        data.interests.forEach((interest: string) => {
          if (interest && !this.memory.interests.includes(interest)) {
            this.memory.interests.push(interest);
          }
        });
      }
      if (data.constraints && typeof data.constraints === "object") {
        if (
          data.constraints.time_per_week !== null &&
          data.constraints.time_per_week !== undefined
        ) {
          this.memory.constraints.time_per_week =
            data.constraints.time_per_week;
        }
        if (
          data.constraints.deadline !== null &&
          data.constraints.deadline !== undefined
        ) {
          this.memory.constraints.deadline = data.constraints.deadline;
        }
      }
      if (data.learning_path_detected) {
        this.memory.learning_path_created = true;
      }
    } catch (error) {
      // Extraction is best-effort, continue if it fails
      console.warn("Memory extraction failed:", error);
    }
  }

  private scheduleActions(): void {
    this.pendingActions = [];

    if (
      this.memory.learning_path_created &&
      !this.memory.scheduled_actions.includes(ActionType.SAVE_LEARNING_PATH)
    ) {
      const learningPathContent = this.extractLearningPathFromMessages();

      this.pendingActions.push({
        type: ActionType.SAVE_LEARNING_PATH,
        data: {
          objective: this.memory.objective,
          learning_path: learningPathContent,
        },
      });

      this.pendingActions.push({
        type: ActionType.SEND_TO_BACKEND,
        data: {
          session_id: this.sessionId,
          memory: this.memory,
          learning_path: learningPathContent,
        },
      });

      this.memory.scheduled_actions.push(ActionType.SAVE_LEARNING_PATH);
    }
  }

  private extractLearningPathFromMessages(): string | null {
    // Look for the message where learning path was created
    const recentMessages = this.chatMessages.slice(-5);
    for (let i = recentMessages.length - 1; i >= 0; i--) {
      const msg = recentMessages[i];
      if (msg.role === "assistant" && msg.content.length > 200) {
        const keywords = ["milestone", "phase", "step", "week"];
        if (keywords.some((kw) => msg.content.toLowerCase().includes(kw))) {
          return msg.content;
        }
      }
    }
    return null;
  }

  async respond(userText: string): Promise<string> {
    // Add user message
    this.chatMessages.push({ role: "user", content: userText });

    // Refresh system prompt
    this.chatMessages[0] = { role: "system", content: this.getSystemPrompt() };

    // Generate response via Next.js API route
    const response = await fetch("/api/openrouter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: this.chatMessages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `API error: ${response.status}`);
    }

    const result = await response.json();
    if (!result.choices || !result.choices[0] || !result.choices[0].message) {
      throw new Error("Invalid API response");
    }
    const assistantText = result.choices[0].message.content.trim();

    // Add assistant response
    this.chatMessages.push({ role: "assistant", content: assistantText });

    // Extract information from the exchange
    await this.extractAndUpdateMemory(userText, assistantText);

    // Schedule any side effects
    this.scheduleActions();

    // Persist to localStorage
    this.saveToLocalStorage();

    return assistantText;
  }

  getMessages(): ChatMessage[] {
    return this.chatMessages;
  }

  getMemory(): AgentMemory {
    return this.memory;
  }

  getPendingActions(): ActionData[] {
    return this.pendingActions;
  }

  clearPendingActions(): void {
    this.pendingActions = [];
  }

  getInitialMessage(): string {
    return this.chatMessages.length > 1
      ? this.chatMessages[this.chatMessages.length - 1].content
      : "Hi! I'm here to help you create a personalized learning path. To get started, could you tell me a bit about yourself and what you're looking to learn?";
  }

  static clearSession(sessionId: string): void {
    localStorage.removeItem(`learning_agent_${sessionId}_memory`);
    localStorage.removeItem(`learning_agent_${sessionId}_messages`);
  }
}
