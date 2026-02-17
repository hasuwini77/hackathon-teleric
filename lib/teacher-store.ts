/**
 * Teacher Session Store
 * Maintains a registry of all teacher sessions (learning paths being actively learned)
 * Separate from the advisor sessions
 */

import type { LearningPath } from "./learning-path-types";
import type { TeacherMemory } from "./teacher-agent";
import type { SessionSummary } from "./session-store";

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

  static getOrCreateSession(
    sessionId: string,
    advisorSummary?: SessionSummary | null,
    advisorLearningPathText?: string | null,
  ): TeacherSession {
    const existing = this.getSession(sessionId);
    if (existing) {
      // If the stored session is a blank placeholder, enrich it with advisor data
      if (!existing.learningPath.objective && (advisorSummary?.objective || advisorLearningPathText)) {
        existing.learningPath.objective = advisorSummary?.objective || "";
        existing.learningPath.title = advisorSummary?.objective || existing.learningPath.title;
        existing.learningPath.description = advisorLearningPathText || advisorSummary?.objective || "";
        existing.learningPath.difficulty = advisorSummary?.skillLevel || existing.learningPath.difficulty;
        existing.learningPath.prerequisites = advisorSummary?.skills || [];
        existing.memory.learningPath = existing.learningPath;
        existing.updatedAt = new Date().toISOString();
        const sessions = this.getAllSessions();
        const idx = sessions.findIndex((s) => s.sessionId === sessionId);
        if (idx >= 0) {
          sessions[idx] = existing;
          localStorage.setItem(TEACHER_SESSIONS_KEY, JSON.stringify(sessions));
        }
      }
      return existing;
    }

    const now = new Date().toISOString();
    const emptyPath: LearningPath = {
      id: sessionId,
      title: advisorSummary?.objective || "New Learning Session",
      description: advisorLearningPathText || advisorSummary?.objective || "",
      objective: advisorSummary?.objective || "",
      difficulty: advisorSummary?.skillLevel || "beginner",
      totalDuration: "",
      prerequisites: advisorSummary?.skills || [],
      milestones: [],
      createdBy: "advisor",
      createdAt: now,
    };

    const memory: TeacherMemory = {
      learningPath: emptyPath,
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
      learningPath: emptyPath,
      createdAt: now,
      updatedAt: now,
      memory,
    };

    const sessions = this.getAllSessions();
    sessions.push(session);
    localStorage.setItem(TEACHER_SESSIONS_KEY, JSON.stringify(sessions));
    return session;
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
