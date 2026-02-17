/**
 * Teacher Agent - Client Side
 * Navigates learning paths, teaches lessons, tests users, tracks progress
 */

import { LearningPath, Milestone, Course } from "./learning-path-types";

export interface TeacherMemory {
  learningPath: LearningPath | null;
  currentMilestoneIndex: number;
  currentCourseIndex: number;
  completedCourses: string[];
  completedMilestones: string[];
  userFeedback: {
    isBoring: boolean;
    difficultyLevel: "too_easy" | "just_right" | "too_hard" | null;
    preferredStyle: "theory" | "practical" | "mixed" | null;
  };
  sessionStarted: Date | null;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface TextResponse {
  type: "text";
  content: string;
}

export interface LessonWithQuizResponse {
  type: "lesson";
  title: string;
  content: string;
  examples: string[];
  keyTakeaways: string[];
  question: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  };
}

export type AgentResponse = TextResponse | LessonWithQuizResponse;

const RESPONSE_SCHEMA = {
  type: "json_schema",
  json_schema: {
    name: "teacher_response",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        type: {
          type: "string",
          enum: ["text", "lesson"],
        },
        content: {
          type: "string",
        },
        title: {
          type: "string",
        },
        examples: {
          type: "array",
          items: {
            type: "string",
          },
        },
        keyTakeaways: {
          type: "array",
          items: {
            type: "string",
          },
        },
        question: {
          type: "object",
          additionalProperties: false,
          properties: {
            id: {
              type: "string",
            },
            question: {
              type: "string",
            },
            options: {
              type: "array",
              items: {
                type: "string",
              },
            },
            correctAnswer: {
              type: "string",
            },
            explanation: {
              type: "string",
            },
          },
          required: [
            "id",
            "question",
            "options",
            "correctAnswer",
            "explanation",
          ],
        },
      },
      required: [
        "type",
        "content",
        "title",
        "examples",
        "keyTakeaways",
        "question",
      ],
    },
  },
} as const;

export class TeacherAgent {
  private memory: TeacherMemory;
  private messages: ChatMessage[];
  private sessionId: string;

  constructor(sessionId: string, learningPath?: LearningPath) {
    this.sessionId = sessionId;
    this.memory = this.initMemory(learningPath);
    this.messages = [];

    this.loadFromLocalStorage();

    if (this.messages.length === 0) {
      this.initializeConversation();
    }
  }

  private initMemory(learningPath?: LearningPath): TeacherMemory {
    return {
      learningPath: learningPath || null,
      currentMilestoneIndex: 0,
      currentCourseIndex: 0,
      completedCourses: [],
      completedMilestones: [],
      userFeedback: {
        isBoring: false,
        difficultyLevel: null,
        preferredStyle: null,
      },
      sessionStarted: null,
    };
  }

  private getStorageKey(suffix: string): string {
    return `teacher_agent_${this.sessionId}_${suffix}`;
  }

  private loadFromLocalStorage(): void {
    try {
      const memoryJson = localStorage.getItem(this.getStorageKey("memory"));
      const messagesJson = localStorage.getItem(this.getStorageKey("messages"));

      if (memoryJson) {
        this.memory = JSON.parse(memoryJson);
      }

      if (messagesJson) {
        this.messages = JSON.parse(messagesJson);
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
        JSON.stringify(this.messages),
      );
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }

  private initializeConversation(): void {
    this.messages.push({
      role: "system",
      content: this.getSystemPrompt(),
    });

    if (this.memory.learningPath) {
      const firstMilestone = this.memory.learningPath.milestones[0];
      this.messages.push({
        role: "assistant",
        content: `Welcome! I'm your teacher for "${this.memory.learningPath.title}". We'll work through ${this.memory.learningPath.milestones.length} milestones together. Ready to start with "${firstMilestone.title}"?`,
      });
    } else {
      this.messages.push({
        role: "assistant",
        content:
          "Hi! I'm your learning teacher. Share your learning path with me, and I'll guide you through it with lessons, examples, and practice questions!",
      });
    }
  }

  private getSystemPrompt(): string {
    const context = this.getCurrentContext();

    return `You are an expert teacher who guides students through a learning path.

Your job: Present lessons and test understanding.

Response Types:
1. "text" - For casual communication, answering questions, or encouragement
   - Just provide helpful content to guide the student

2. "lesson" - For teaching new concepts (always include ALL fields)
   - title: The lesson name
   - content: Detailed explanation of the concept
   - examples: Array of 2-3 practical code/real-world examples
   - keyTakeaways: Array of 3-5 important points to remember
   - question: A single multiple-choice question to test understanding
     * id: unique identifier
     * question: the test question
     * options: array of 4 answer choices
     * correctAnswer: the correct option text
     * explanation: why this answer is correct

Current Context:
${context}

Teaching Guidelines:
- Start with a lesson when user is ready to learn
- Each lesson MUST include a quiz question to test understanding
- Use real-world examples
- Keep explanations clear and concise
- Adapt based on feedback (boring → more examples, too hard → simpler explanations)
- Always be encouraging

Return responses as JSON matching the schema.`;
  }

  private getCurrentContext(): string {
    if (!this.memory.learningPath) {
      return "- No learning path loaded yet";
    }

    const path = this.memory.learningPath;
    const milestone = path.milestones[this.memory.currentMilestoneIndex];
    const course = milestone?.courses[this.memory.currentCourseIndex];

    const parts = [
      `Learning Path: ${path.title}`,
      `Current Milestone: ${milestone?.title} (${this.memory.currentMilestoneIndex + 1}/${path.milestones.length})`,
      `Current Course: ${course?.title || "None"}`,
      `Completed: ${this.memory.completedCourses.length} courses, ${this.memory.completedMilestones.length} milestones`,
    ];

    if (this.memory.userFeedback.isBoring) {
      parts.push("⚠️ User finds content boring - add more practical examples");
    }
    if (this.memory.userFeedback.difficultyLevel === "too_hard") {
      parts.push("⚠️ Content is too difficult - simplify and add foundations");
    }
    if (this.memory.userFeedback.difficultyLevel === "too_easy") {
      parts.push("⚠️ Content is too easy - add advanced challenges");
    }

    return parts.map((p) => `- ${p}`).join("\n");
  }

  setLearningPath(path: LearningPath): void {
    this.memory.learningPath = path;
    this.memory.currentMilestoneIndex = 0;
    this.memory.currentCourseIndex = 0;
    this.memory.sessionStarted = new Date();
    this.saveToLocalStorage();

    // Update system message with new context
    if (this.messages[0]?.role === "system") {
      this.messages[0].content = this.getSystemPrompt();
    }
  }

  markCourseComplete(): void {
    if (!this.memory.learningPath) return;

    const milestone =
      this.memory.learningPath.milestones[this.memory.currentMilestoneIndex];
    const course = milestone?.courses[this.memory.currentCourseIndex];

    if (course && !this.memory.completedCourses.includes(course.id)) {
      this.memory.completedCourses.push(course.id);
    }

    // Move to next course or milestone
    if (this.memory.currentCourseIndex < milestone.courses.length - 1) {
      this.memory.currentCourseIndex++;
    } else if (
      this.memory.currentMilestoneIndex <
      this.memory.learningPath.milestones.length - 1
    ) {
      this.memory.completedMilestones.push(milestone.id);
      this.memory.currentMilestoneIndex++;
      this.memory.currentCourseIndex = 0;
    }

    this.saveToLocalStorage();
  }

  setFeedback(feedback: Partial<TeacherMemory["userFeedback"]>): void {
    this.memory.userFeedback = { ...this.memory.userFeedback, ...feedback };
    this.saveToLocalStorage();

    // Update system prompt with new feedback
    if (this.messages[0]?.role === "system") {
      this.messages[0].content = this.getSystemPrompt();
    }
  }

  private async callOpenRouter(body: {
    messages: ChatMessage[];
    temperature: number;
    max_tokens: number;
    response_format?: typeof RESPONSE_SCHEMA;
  }): Promise<{ content: string }> {
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

  async respond(userMessage: string): Promise<AgentResponse> {
    this.messages.push({ role: "user", content: userMessage });

    // Update system message with current context
    if (this.messages[0]?.role === "system") {
      this.messages[0].content = this.getSystemPrompt();
    }

    try {
      const message = await this.callOpenRouter({
        messages: this.messages,
        temperature: 0.7,
        max_tokens: 1500,
        response_format: RESPONSE_SCHEMA,
      });

      const response: AgentResponse = JSON.parse(message.content);

      this.messages.push({
        role: "assistant",
        content: JSON.stringify(response),
      });

      this.saveToLocalStorage();

      return response;
    } catch (error) {
      console.error("Teacher response failed:", error);

      // Fallback response
      const fallback: TextResponse = {
        type: "text",
        content:
          "I'm having trouble right now. Could you rephrase your question?",
      };

      this.messages.push({
        role: "assistant",
        content: JSON.stringify(fallback),
      });

      return fallback;
    }
  }

  getProgress(): {
    currentMilestone: Milestone | null;
    currentCourse: Course | null;
    completionPercentage: number;
    totalCourses: number;
    completedCount: number;
  } {
    if (!this.memory.learningPath) {
      return {
        currentMilestone: null,
        currentCourse: null,
        completionPercentage: 0,
        totalCourses: 0,
        completedCount: 0,
      };
    }

    const milestone =
      this.memory.learningPath.milestones[this.memory.currentMilestoneIndex];
    const course = milestone?.courses[this.memory.currentCourseIndex];

    const totalCourses = this.memory.learningPath.milestones.reduce(
      (sum: number, m: Milestone) => sum + m.courses.length,
      0,
    );
    const completedCount = this.memory.completedCourses.length;
    const completionPercentage =
      totalCourses > 0 ? (completedCount / totalCourses) * 100 : 0;

    return {
      currentMilestone: milestone || null,
      currentCourse: course || null,
      completionPercentage: Math.round(completionPercentage),
      totalCourses,
      completedCount,
    };
  }

  getMessages(): ChatMessage[] {
    return this.messages.filter((m) => m.role !== "system");
  }

  static clearSession(sessionId: string): void {
    localStorage.removeItem(`teacher_agent_${sessionId}_memory`);
    localStorage.removeItem(`teacher_agent_${sessionId}_messages`);
  }
}
