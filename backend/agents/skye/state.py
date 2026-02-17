"""State schemas for the SKYE learning path agent."""

from typing import Annotated

from langchain_core.messages import BaseMessage
from typing_extensions import TypedDict


def merge_lists(left: list, right: list) -> list:
    """Reducer that appends new messages to existing history."""
    if left is None:
        left = []
    if right is None:
        right = []
    return left + right


DEFAULT_MEMORY = {
    "objective": None,
    "relevant_experience": None,
    "background": None,
    "skill_level": None,
    "relevant_skills": [],
    "required_skills": [],
    "interests": [],
    "time_per_week": None,
    "deadline": None,
    "learning_path_created": False,
    "scheduled_actions": [],
}


class SkyeState(TypedDict, total=False):
    """Full state for the SKYE agent workflow."""

    # User input (set by human_input_node on each turn)
    user_message: str

    # Chat history (LangChain messages, accumulated via reducer)
    chat_history: Annotated[list[BaseMessage], merge_lists]

    # Last assistant response text
    chat_response: str

    # Agent memory — persisted across turns, mirrors frontend AgentMemory
    memory: dict

    # Session / user context (set once at start)
    session_id: str | None
    user_id: str | None


class SkyeInput(TypedDict, total=False):
    """Input schema — what the client sends to start a run."""

    user_message: str
    session_id: str | None
    user_id: str | None


class SkyeOutput(TypedDict, total=False):
    """Output schema — what the client receives."""

    chat_response: str
    memory: dict
