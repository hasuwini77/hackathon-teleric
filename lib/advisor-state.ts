/**
 * Agent State Management
 * Handles memory persistence and state-related operations
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

export class AgentState {
  private sessionId: string;
  private memory: AgentMemory;
  private chatMessages: ChatMessage[];

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.memory = this.initMemory();
    this.chatMessages = [];
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

  loadFromLocalStorage(): void {
    try {
      const memoryJson = localStorage.getItem(this.getStorageKey("memory"));
      const messagesJson = localStorage.getItem(this.getStorageKey("messages"));

      if (memoryJson) {
        this.memory = JSON.parse(memoryJson);
      }

      if (messagesJson) {
        this.chatMessages = JSON.parse(messagesJson);
      }
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
    }
  }

  saveToLocalStorage(): void {
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

  getMemory(): AgentMemory {
    return this.memory;
  }

  getMessages(): ChatMessage[] {
    return this.chatMessages;
  }

  addMessage(message: ChatMessage): void {
    this.chatMessages.push(message);
  }

  updateSystemMessage(content: string): void {
    if (this.chatMessages[0]?.role === "system") {
      this.chatMessages[0].content = content;
    } else {
      this.chatMessages.unshift({ role: "system", content });
    }
  }

  getSessionId(): string {
    return this.sessionId;
  }

  static clearSession(sessionId: string): void {
    localStorage.removeItem(`learning_agent_${sessionId}_memory`);
    localStorage.removeItem(`learning_agent_${sessionId}_messages`);
  }
}
