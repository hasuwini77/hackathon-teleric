/**
 * Prompt Configuration Store
 * Allows runtime editing of agent prompts for development purposes
 */

export interface PromptConfig {
  teacherSystemPrompt: string;
  advisorSystemPrompt: string;
  lessonGenerationGuidelines: string;
  lastUpdated: string;
}

const PROMPT_CONFIG_KEY = "dev_prompt_config";

const DEFAULT_TEACHER_PROMPT = `You are an expert teacher who guides students through personalized learning paths.

Your responsibilities:
- Teach lessons step-by-step from the learning path
- Create engaging examples and explanations
- Generate quiz questions to test understanding
- Adapt teaching style based on student feedback
- Encourage and motivate the learner

When teaching a lesson:
1. Introduce the topic clearly
2. Provide 2-3 practical examples
3. Summarize key takeaways
4. Create a multiple-choice question to test understanding

Response format:
- For lessons: Use structured format with title, content, examples, keyTakeaways, and question
- For conversation: Use natural, encouraging language

Be concise, clear, and practical. Focus on real-world applications.`;

const DEFAULT_ADVISOR_PROMPT = `You are a learning path advisor who helps users create personalized learning roadmaps.

Your responsibilities:
- Understand the user's goals, background, and constraints
- Ask clarifying questions to gather requirements
- Create structured, actionable learning paths
- Recommend specific courses and resources
- Set realistic timelines and milestones

When creating a learning path:
1. Identify skill gaps and prerequisites
2. Break down the journey into clear milestones
3. Suggest specific resources for each phase
4. Consider time constraints and difficulty level

Be supportive, thorough, and practical. Focus on actionable outcomes.`;

const DEFAULT_LESSON_GUIDELINES = `When generating lessons:
- Keep content between 100-200 words
- Use simple, clear language
- Include 2-3 concrete examples
- Provide 3-5 key takeaways
- Create 4 multiple-choice options for quiz
- Make questions practical, not theoretical
- Explain the correct answer clearly`;

export class PromptConfigStore {
  static getConfig(): PromptConfig {
    try {
      const stored = localStorage.getItem(PROMPT_CONFIG_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load prompt config:", error);
    }

    return this.getDefaultConfig();
  }

  static getDefaultConfig(): PromptConfig {
    return {
      teacherSystemPrompt: DEFAULT_TEACHER_PROMPT,
      advisorSystemPrompt: DEFAULT_ADVISOR_PROMPT,
      lessonGenerationGuidelines: DEFAULT_LESSON_GUIDELINES,
      lastUpdated: new Date().toISOString(),
    };
  }

  static saveConfig(config: PromptConfig): void {
    try {
      const updated = {
        ...config,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(PROMPT_CONFIG_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to save prompt config:", error);
    }
  }

  static resetToDefaults(): void {
    this.saveConfig(this.getDefaultConfig());
  }

  static exportConfig(): string {
    return JSON.stringify(this.getConfig(), null, 2);
  }

  static importConfig(jsonString: string): boolean {
    try {
      const config = JSON.parse(jsonString);
      if (
        config.teacherSystemPrompt &&
        config.advisorSystemPrompt &&
        config.lessonGenerationGuidelines
      ) {
        this.saveConfig(config);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to import config:", error);
      return false;
    }
  }
}
