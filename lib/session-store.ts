/**
 * Session Store
 * Maintains a registry of all advisor sessions in localStorage
 * under a single well-known key: "learning_agent_sessions"
 */

import type { AgentMemory } from "./advisor-state";

export interface SessionSummary {
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  objective: string | null;
  skillLevel: string | null;
  skills: string[];
  learningPathCreated: boolean;
}

const SESSIONS_KEY = "learning_agent_sessions";

export class SessionStore {
  static getAllSessions(): SessionSummary[] {
    try {
      const raw = localStorage.getItem(SESSIONS_KEY);
      if (!raw) return [];
      const sessions: SessionSummary[] = JSON.parse(raw);
      return sessions.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    } catch {
      return [];
    }
  }

  static getMostRecentSession(): SessionSummary | null {
    const sessions = SessionStore.getAllSessions();
    return sessions.length > 0 ? sessions[0] : null;
  }

  static upsertSession(sessionId: string, memory: AgentMemory): void {
    const sessions = SessionStore.getAllSessions();
    const now = new Date().toISOString();
    const existingIdx = sessions.findIndex((s) => s.sessionId === sessionId);

    const summary: SessionSummary = {
      sessionId,
      createdAt:
        existingIdx >= 0 ? sessions[existingIdx].createdAt : now,
      updatedAt: now,
      objective: memory.objective,
      skillLevel: memory.skill_level,
      skills: memory.relevant_skills,
      learningPathCreated: memory.learning_path_created,
    };

    if (existingIdx >= 0) {
      sessions[existingIdx] = summary;
    } else {
      sessions.push(summary);
    }

    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }

  static removeSession(sessionId: string): void {
    const sessions = SessionStore.getAllSessions().filter(
      (s) => s.sessionId !== sessionId,
    );
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }

  static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
