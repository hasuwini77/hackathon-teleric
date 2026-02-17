"""Core agent logic for the SKYE learning path advisor.

Handles:
- Conversational LLM calls with tool execution loop
- Structured extraction of user profile data
- Memory updates from extraction results
"""

import json
from typing import Sequence

from langchain_core.callbacks import adispatch_custom_event
from langchain_core.messages import (
    AIMessage,
    BaseMessage,
    HumanMessage,
    SystemMessage,
    ToolMessage,
)
from langchain_core.runnables import RunnableConfig
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

from agents.skye.prompts import EXTRACTION_SYSTEM_PROMPT, build_system_prompt
from agents.skye.tools import SKYE_TOOLS
from app.config import settings


# ---------------------------------------------------------------------------
# Extraction schema
# ---------------------------------------------------------------------------


class ExtractionData(BaseModel):
    """Structured data extracted from a conversation turn."""

    objective: str | None = None
    relevant_experience: str | None = None
    background: str | None = None
    skill_level: str | None = None
    relevant_skills: list[str] = Field(default_factory=list)
    required_skills: list[str] = Field(default_factory=list)
    interests: list[str] = Field(default_factory=list)
    time_per_week: str | None = None
    deadline: str | None = None
    learning_path_detected: bool = False


# ---------------------------------------------------------------------------
# LLM helpers
# ---------------------------------------------------------------------------


def _get_chat_llm() -> ChatOpenAI:
    """LLM for conversation — with tools bound."""
    return ChatOpenAI(
        model="google/gemini-2.0-flash-001",
        api_key=settings.openrouter_api_key,
        base_url="https://openrouter.ai/api/v1",
        temperature=0.7,
        max_tokens=1200,
    )


def _get_extraction_llm() -> ChatOpenAI:
    """LLM for structured extraction — deterministic, no tools."""
    return ChatOpenAI(
        model="google/gemini-2.0-flash-001",
        api_key=settings.openrouter_api_key,
        base_url="https://openrouter.ai/api/v1",
        temperature=0.0,
        max_tokens=500,
    )


def _get_tool_preview(tool_name: str, tool_args: dict) -> str:
    """Compact preview of a tool call for SSE streaming."""
    if tool_name == "search_content":
        return tool_args.get("query", "")[:60]
    elif tool_name == "search_skills":
        return tool_args.get("query", "")[:60]
    return tool_name


# ---------------------------------------------------------------------------
# Main chat function
# ---------------------------------------------------------------------------


async def run_chat(
    messages: Sequence[BaseMessage],
    user_message: str,
    memory: dict,
    langchain_config: RunnableConfig | None = None,
) -> dict:
    """Run one conversation turn with optional tool calls.

    Args:
        messages: Chat history (LangChain BaseMessage objects).
        user_message: Current user input.
        memory: Current agent memory dict.
        langchain_config: RunnableConfig for emitting streaming events.

    Returns:
        Dict with keys: response, memory (updated).
    """

    async def emit_tool_event(tool_name: str, tool_args: dict):
        if langchain_config:
            preview = _get_tool_preview(tool_name, tool_args)
            try:
                await adispatch_custom_event(
                    "tool_call",
                    {"tool": tool_name, "preview": preview},
                    config=langchain_config,
                )
            except Exception:
                pass

    # 1. Build messages for LLM
    system_prompt = build_system_prompt(memory)
    chat_messages: list[BaseMessage] = [SystemMessage(content=system_prompt)]

    # Add last N messages from history (keep context window manageable)
    recent = list(messages)[-20:]
    chat_messages.extend(recent)

    # Add current user message
    chat_messages.append(HumanMessage(content=user_message))

    # 2. LLM call with tool loop
    llm = _get_chat_llm().bind_tools(SKYE_TOOLS)
    tool_map = {t.name: t for t in SKYE_TOOLS}

    max_iterations = 10
    for _ in range(max_iterations):
        response = await llm.ainvoke(chat_messages, config=langchain_config)

        # If no tool calls, we have the final response
        if not response.tool_calls:
            break

        # Add assistant message with tool calls to history
        chat_messages.append(response)

        # Execute each tool call
        for tool_call in response.tool_calls:
            name = tool_call["name"]
            args = tool_call["args"]
            call_id = tool_call["id"]

            await emit_tool_event(name, args)

            if name in tool_map:
                try:
                    result = await tool_map[name].ainvoke(args)
                except Exception as e:
                    result = json.dumps({"error": str(e)})
            else:
                result = json.dumps({"error": f"Unknown tool: {name}"})

            chat_messages.append(
                ToolMessage(content=result, tool_call_id=call_id)
            )
    else:
        # Max iterations — use whatever we have
        pass

    assistant_text = response.content if isinstance(response, AIMessage) else str(response)

    # 3. Extraction — update memory
    updated_memory = await run_extraction(user_message, assistant_text, memory)

    return {
        "response": assistant_text,
        "memory": updated_memory,
    }


# ---------------------------------------------------------------------------
# Extraction
# ---------------------------------------------------------------------------


async def run_extraction(
    user_text: str,
    assistant_text: str,
    memory: dict,
) -> dict:
    """Run a structured extraction call and merge results into memory.

    Returns the updated memory dict (does not mutate the original).
    """
    try:
        llm = _get_extraction_llm().with_structured_output(ExtractionData)

        extraction_messages = [
            SystemMessage(content=EXTRACTION_SYSTEM_PROMPT),
            HumanMessage(
                content=f"User message: {user_text}\n\nAssistant response: {assistant_text}"
            ),
        ]

        extracted: ExtractionData = await llm.ainvoke(extraction_messages)
        return update_memory(memory, extracted)

    except Exception as e:
        print(f"[skye:extract] Extraction failed: {e}")
        return memory


def update_memory(memory: dict, data: ExtractionData) -> dict:
    """Merge extraction data into agent memory. Returns a new dict."""
    updated = {**memory}

    # Simple fields — only set if not already present
    for field in ("objective", "relevant_experience", "background", "skill_level"):
        value = getattr(data, field)
        if value and not updated.get(field):
            updated[field] = value

    # Array fields — append unique items
    for field in ("relevant_skills", "required_skills", "interests"):
        new_items = getattr(data, field) or []
        existing = updated.get(field, [])
        for item in new_items:
            if item and item not in existing:
                existing = [*existing, item]
        updated[field] = existing

    # Constraints
    if data.time_per_week:
        updated["time_per_week"] = data.time_per_week
    if data.deadline:
        updated["deadline"] = data.deadline

    # Learning path flag
    if data.learning_path_detected:
        updated["learning_path_created"] = True

    return updated
