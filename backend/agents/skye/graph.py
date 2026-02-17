"""LangGraph workflow for the SKYE learning path advisor.

Flow: START → chat → human_input (loop)

The chat node handles conversation + tool calls + extraction in one step.
The human_input node interrupts to wait for the next user message.
"""

from typing import Literal

from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.runnables import RunnableConfig
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command, interrupt

from agents.skye.agent import run_chat
from agents.skye.prompts import WELCOME_MESSAGE
from agents.skye.state import DEFAULT_MEMORY, SkyeInput, SkyeOutput, SkyeState


# =============================================================================
# NODE FUNCTIONS
# =============================================================================


async def chat_node(
    state: SkyeState,
    config: RunnableConfig,
) -> Command[Literal["human_input", "__end__"]]:
    """Main conversational node.

    1. Builds dynamic system prompt from memory
    2. Calls LLM with tools (search_content, search_skills)
    3. Runs extraction to update memory
    4. Routes to human_input (or END on goodbye)
    """
    user_message = state.get("user_message", "")
    memory = state.get("memory") or {**DEFAULT_MEMORY}

    # No message — send welcome
    if not user_message:
        return Command(
            update={
                "chat_response": WELCOME_MESSAGE,
                "chat_history": [AIMessage(content=WELCOME_MESSAGE)],
                "memory": memory,
            },
            goto="human_input",
        )

    # Check for goodbye
    end_keywords = ["goodbye", "bye", "exit", "quit", "end session"]
    if any(kw in user_message.lower() for kw in end_keywords):
        farewell = (
            "Thank you for the conversation! Your learning path and progress "
            "are saved. Come back anytime to continue. Good luck!"
        )
        return Command(
            update={
                "chat_response": farewell,
                "chat_history": [
                    HumanMessage(content=user_message),
                    AIMessage(content=farewell),
                ],
                "memory": memory,
            },
            goto=END,
        )

    # Run the chat agent (conversation + tools + extraction)
    result = await run_chat(
        messages=state.get("chat_history", []),
        user_message=user_message,
        memory=memory,
        langchain_config=config,
    )

    response = result["response"]
    updated_memory = result["memory"]

    return Command(
        update={
            "chat_response": response,
            "chat_history": [
                HumanMessage(content=user_message),
                AIMessage(content=response),
            ],
            "memory": updated_memory,
        },
        goto="human_input",
    )


def human_input_node(state: SkyeState) -> Command[Literal["chat"]]:
    """Interrupt execution and wait for the next user message."""
    user_input = interrupt({
        "message": "Ready for your message.",
        "last_response": state.get("chat_response"),
        "memory": state.get("memory"),
    })

    return Command(
        update={"user_message": user_input},
        goto="chat",
    )


# =============================================================================
# BUILD GRAPH
# =============================================================================


def build_skye_graph() -> StateGraph:
    """Build the SKYE learning path advisor workflow.

    START → chat → human_input (loop)
    """
    workflow = StateGraph(
        SkyeState,
        input=SkyeInput,
        output=SkyeOutput,
    )

    workflow.add_node("chat", chat_node)
    workflow.add_node("human_input", human_input_node)

    workflow.add_edge(START, "chat")
    # Routing handled by Command.goto in node functions

    return workflow


# =============================================================================
# COMPILED GRAPH
# =============================================================================

checkpointer = MemorySaver()
skye_graph = build_skye_graph().compile(checkpointer=checkpointer)
