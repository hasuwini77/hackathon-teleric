"""System prompts and extraction prompts for the SKYE agent."""

WELCOME_MESSAGE = (
    "Hi! I'm here to help you create a personalized learning path. "
    "To get started, could you tell me a bit about yourself and what "
    "you're looking to learn?"
)

BASE_SYSTEM_PROMPT = """\
You are an expert AI learning advisor that helps users build personalized learning paths.

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
- Keep the questions to a minimum and only ask for missing information that is essential to creating the minimum learning path

Tools:
- You have access to search_content and search_skills tools.
- Use search_content when you want to find specific learning resources (articles, courses, videos) to recommend.
- Use search_skills to look up recognized skills in the database when mapping the user's abilities.
- Only use tools when they add value — don't search for every topic the user mentions."""


def build_system_prompt(memory: dict) -> str:
    """Build the dynamic system prompt from current agent memory."""
    parts = _build_context_parts(memory)
    context = "\n\nCurrent context:\n" + "\n".join(f"- {p}" for p in parts)
    return BASE_SYSTEM_PROMPT + context


def _build_context_parts(memory: dict) -> list[str]:
    """Build context lines showing what's known vs. missing."""
    parts: list[str] = []

    parts.append(
        f"Objective: {memory['objective']}"
        if memory.get("objective")
        else "Still need: Clear learning objective"
    )
    parts.append(
        f"Experience: {memory['relevant_experience']}"
        if memory.get("relevant_experience")
        else "Still need: Current skill level and experience"
    )

    if memory.get("background"):
        parts.append(f"Background: {memory['background']}")
    if memory.get("skill_level"):
        parts.append(f"Skill Level: {memory['skill_level']}")
    if memory.get("interests"):
        parts.append(f"Interests: {', '.join(memory['interests'])}")
    if memory.get("relevant_skills"):
        parts.append(
            f"Skills User Already Has: {', '.join(memory['relevant_skills'])}"
        )

    if memory.get("required_skills"):
        parts.append(
            f"Required Skills to Learn: {', '.join(memory['required_skills'])}"
        )
        parts.append(
            "IMPORTANT: Focus the learning path on the required skills. "
            "Do NOT include skills the user already has."
        )

    constraints = []
    if memory.get("time_per_week"):
        constraints.append(f"Time: {memory['time_per_week']}")
    if memory.get("deadline"):
        constraints.append(f"Deadline: {memory['deadline']}")
    if constraints:
        parts.append(f"Constraints: {', '.join(constraints)}")

    if memory.get("learning_path_created"):
        parts.append("Learning path has been created")
    else:
        missing = []
        if not memory.get("objective"):
            missing.append("learning objective")
        if not memory.get("relevant_experience"):
            missing.append("experience level")

        if missing:
            parts.append(f"Focus on understanding: {', '.join(missing)}")
        elif not memory.get("time_per_week") and not memory.get("deadline"):
            parts.append("Consider asking about time availability or constraints")
        else:
            parts.append("Ready to create learning path!")

    return parts


EXTRACTION_SYSTEM_PROMPT = """\
Extract structured information from the user's message and the assistant's response.
Fill in any new information clearly stated or strongly implied.
Use null for missing strings, [] for empty arrays.

IMPORTANT - Skills extraction:
- relevant_skills: Skills the user ALREADY HAS or CURRENTLY KNOWS \
(e.g., "I know Python", "experienced in programming", "professional developer")
- required_skills: Skills the user NEEDS TO LEARN or wants to acquire \
(e.g., "want to learn ML", "need to understand RL", "looking to master AI")
- When extracting from experience/background, put known skills in relevant_skills
- When extracting from objectives/goals, put target skills in required_skills
- Be specific and granular with skill names

Set learning_path_detected to true if the assistant's response contains a \
structured learning path with milestones, phases, steps, or weeks."""
