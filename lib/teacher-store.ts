/**
 * Teacher Session Store
 * Maintains a registry of all teacher sessions (learning paths being actively learned)
 * Separate from the advisor sessions
 */

import type { LearningPath } from "./learning-path-types";
import type { TeacherMemory } from "./teacher-agent";

export interface TeacherSession {
  sessionId: string;
  learningPath: LearningPath;
  createdAt: string;
  updatedAt: string;
  memory: TeacherMemory;
}

const TEACHER_SESSIONS_KEY = "teacher_sessions";

export class TeacherStore {
  static getAllSessions(): TeacherSession[] {
    try {
      const raw = localStorage.getItem(TEACHER_SESSIONS_KEY);
      if (!raw) return [];
      const sessions: TeacherSession[] = JSON.parse(raw);
      return sessions.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    } catch {
      return [];
    }
  }

  static getSession(sessionId: string): TeacherSession | null {
    const sessions = this.getAllSessions();
    return sessions.find((s) => s.sessionId === sessionId) || null;
  }

  static createSession(learningPath: LearningPath): string {
    const sessionId = `teacher_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const now = new Date().toISOString();

    const memory: TeacherMemory = {
      learningPath,
      currentMilestoneIndex: 0,
      currentCourseIndex: 0,
      completedCourses: [],
      completedMilestones: [],
      userFeedback: {
        isBoring: false,
        difficultyLevel: null,
        preferredStyle: null,
      },
      sessionStarted: new Date(),
    };

    const session: TeacherSession = {
      sessionId,
      learningPath,
      createdAt: now,
      updatedAt: now,
      memory,
    };

    const sessions = this.getAllSessions();
    sessions.push(session);
    localStorage.setItem(TEACHER_SESSIONS_KEY, JSON.stringify(sessions));

    return sessionId;
  }

  static updateSession(sessionId: string, memory: TeacherMemory): void {
    const sessions = this.getAllSessions();
    const index = sessions.findIndex((s) => s.sessionId === sessionId);

    if (index >= 0) {
      sessions[index].memory = memory;
      sessions[index].updatedAt = new Date().toISOString();
      localStorage.setItem(TEACHER_SESSIONS_KEY, JSON.stringify(sessions));
    }
  }

  static removeSession(sessionId: string): void {
    const sessions = this.getAllSessions().filter(
      (s) => s.sessionId !== sessionId,
    );
    localStorage.setItem(TEACHER_SESSIONS_KEY, JSON.stringify(sessions));
  }
}
