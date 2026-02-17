/**
 * Learning Path Structures
 * Defines the format for learning paths created by the advisor agent
 */

export interface Course {
  id: string;
  title: string;
  provider: string;
  url: string;
  duration: string;
  type: "video" | "article" | "course" | "documentation" | "practice";
  description: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  estimatedWeeks: number;
  courses: Course[];
  outcomes: string[];
  projects?: string[];
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  objective: string;
  difficulty: string;
  totalDuration: string;
  prerequisites: string[];
  milestones: Milestone[];
  createdBy: "advisor" | "curated";
  createdAt: string;
}
