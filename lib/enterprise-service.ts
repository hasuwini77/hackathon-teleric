import { LearningPathAgent } from "./advisor-agent";

/**
 * Enterprise Signal Chain
 * This service manages mock "internal company" data.
 * It's designed to be a separate layer ("Signal") that can be plugged 
 * into the main Agent without modifying its core logic.
 */

interface InternalUserProfile {
  role: string;
  focus: string;
  certs: string[];
  objective?: string;
  skills?: string[];
}

// Mock "Internal Company Database"
const COMPANY_DB: Record<string, InternalUserProfile> = {
  "sr-frontend-123": {
    role: "Senior Frontend Developer",
    focus: "Transitioning into Technical Leadership and mastering System Design",
    certs: ["Cloud Architecture 101", "Security Best Practices", "Team Management Essentials"],
    objective: "Step into a Staff Engineer role by mastering distributed systems and leading cross-functional teams.",
    skills: ["React", "TypeScript", "Next.js", "Performance Optimization"]
  },
  "jr-ux-456": {
    role: "Junior UI/UX Designer",
    focus: "Mastering Design Systems and Interactive Prototyping in Figma",
    certs: ["Accessibility Standards", "Typography & Layout"],
    objective: "To become a Lead Product Designer specialized in accessible and inclusive design systems.",
    skills: ["Figma", "Sketch", "Prototyping", "User Research"]
  },
  "backend-ai-789": {
    role: "Backend Engineer",
    focus: "Integrating LLMs into existing microservices and learning PyTorch",
    certs: ["Advanced Python", "Kubernetes Certified"],
    objective: "Specialize in AI Engineering to bridge the gap between traditional backend and machine learning models.",
    skills: ["Node.js", "Go", "Docker", "PostgreSQL"]
  },
  "cs-manager-000": {
    role: "Customer Success Manager",
    focus: "Learning SQL and Data Visualization to build automated client reports",
    certs: ["Relationship Management", "Product Analytics"],
    objective: "Master data analytics to drive proactive customer success strategies and reduce churn.",
    skills: ["Salesforce", "Intercom", "Customer Journey Mapping"]
  },
  "default": {
    role: "Employee",
    focus: "General Professional Development",
    certs: [],
    objective: "",
    skills: []
  }
};

export class EnterpriseSignalChain {
  /**
   * Applies internal enterprise data to an agent instance.
   * This mimics an automatic fetch from a backend corporate DB on session start.
   */
  static apply(agent: LearningPathAgent, sessionId: string): void {
    const internalData = COMPANY_DB[sessionId] || COMPANY_DB["default"];
    
    if (internalData) {
      const signal = `
Current Role: ${internalData.role}
Growth Focus: ${internalData.focus}
Internal Certifications: ${internalData.certs.join(", ")}
      `.trim();

      agent.setEnterpriseContext(signal);

      // Reset and Seed the agent's memory for the new persona
      const memory = agent.getMemory();
      
      // 1. Clear existing conversational data (to avoid mixing personas)
      memory.objective = internalData.objective || null;
      memory.relevant_skills = internalData.skills ? [...internalData.skills] : [];
      memory.required_skills = []; 
      memory.learning_path_created = false;
      memory.scheduled_actions = []; // Reset scheduled actions for the new persona
      
      // Note: We keep background and experience as null or seed them if we had that data,
      // but for this demo, objective and skills are the primary visuals.
      memory.background = null;
      memory.skill_level = null;
      memory.relevant_experience = null;
    }
  }

  static getProfiles() {
    return COMPANY_DB;
  }
}
