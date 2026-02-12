/**
 * Agent Actions
 * Defines action types and handles action scheduling/execution
 */

import { AgentMemory, ChatMessage } from "./agent-state";

export interface ActionData {
  type: string;
  data: Record<string, any>;
}

export class ActionType {
  static readonly SAVE_LEARNING_PATH = "save_learning_path";
  static readonly SEARCH_WEB = "search_web";
  static readonly SEND_TO_BACKEND = "send_to_backend";
}

export class AgentActions {
  private pendingActions: ActionData[];

  constructor() {
    this.pendingActions = [];
  }

  scheduleActions(
    memory: AgentMemory,
    messages: ChatMessage[],
    sessionId: string,
  ): void {
    this.pendingActions = [];

    if (
      memory.learning_path_created &&
      !memory.scheduled_actions.includes(ActionType.SAVE_LEARNING_PATH)
    ) {
      const learningPathContent =
        this.extractLearningPathFromMessages(messages);

      this.pendingActions.push({
        type: ActionType.SAVE_LEARNING_PATH,
        data: {
          objective: memory.objective,
          learning_path: learningPathContent,
        },
      });

      this.pendingActions.push({
        type: ActionType.SEND_TO_BACKEND,
        data: {
          session_id: sessionId,
          memory: memory,
          learning_path: learningPathContent,
        },
      });

      memory.scheduled_actions.push(ActionType.SAVE_LEARNING_PATH);
    }
  }

  private extractLearningPathFromMessages(
    messages: ChatMessage[],
  ): string | null {
    // Look for the message where learning path was created
    const recentMessages = messages.slice(-5);
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

  getPendingActions(): ActionData[] {
    return this.pendingActions;
  }

  clearPendingActions(): void {
    this.pendingActions = [];
  }
}
