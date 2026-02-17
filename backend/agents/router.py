"""FastAPI router for the SKYE agent with SSE streaming.

Follows the LangGraph interrupt/resume pattern:
- POST /threads            → create a new thread
- POST /threads/{id}/stream → start or resume a conversation (SSE)
- GET  /threads/{id}/state  → get current thread state
"""

import json
import time
import uuid

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from langgraph.types import Command, Interrupt
from pydantic import BaseModel

from agents.skye.graph import skye_graph

router = APIRouter()


# ---------------------------------------------------------------------------
# Request / response models
# ---------------------------------------------------------------------------


class RunRequest(BaseModel):
    """Body for the streaming endpoint."""

    input: dict | None = None
    command: dict | None = None


class ThreadCreate(BaseModel):
    thread_id: str | None = None


# ---------------------------------------------------------------------------
# Serialisation helpers
# ---------------------------------------------------------------------------


def _make_serializable(obj):
    """Recursively convert non-JSON-serializable objects."""
    if isinstance(obj, Interrupt):
        return {
            "__interrupt__": True,
            "value": _make_serializable(obj.value) if hasattr(obj, "value") else None,
        }
    elif isinstance(obj, dict):
        return {k: _make_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [_make_serializable(item) for item in obj]
    elif hasattr(obj, "__dict__"):
        try:
            return {
                k: _make_serializable(v)
                for k, v in obj.__dict__.items()
                if not k.startswith("_")
            }
        except Exception:
            return str(obj)
    else:
        try:
            json.dumps(obj)
            return obj
        except (TypeError, ValueError):
            return str(obj)


# ---------------------------------------------------------------------------
# SSE Streaming endpoint
# ---------------------------------------------------------------------------


@router.post("/threads/{thread_id}/stream")
async def stream_run(thread_id: str, request: RunRequest, raw_request: Request):
    """Stream a conversation turn via Server-Sent Events.

    Two modes:
    - **New run**: send ``{"input": {"user_message": "...", "user_id": "..."}}``
    - **Resume** (subsequent turns): send ``{"command": {"resume": "user text"}}``
    """

    async def event_generator():
        config = {"configurable": {"thread_id": thread_id}}
        request_msg_id = f"chat-{thread_id}-{int(time.time() * 1000)}"

        try:
            # --- Determine input type ---
            if request.input:
                input_data = request.input
                event_source = skye_graph.astream_events(
                    input_data, config=config, version="v2",
                )

            elif request.command and "resume" in request.command:
                # Verify the thread has pending state
                current_state = skye_graph.get_state(config)
                if not current_state or not current_state.next:
                    yield _sse("error", {"error": "session_expired", "message": "No pending state. Start a new session."})
                    return

                resume_input = Command(resume=request.command["resume"])
                event_source = skye_graph.astream_events(
                    resume_input, config=config, version="v2",
                )

            else:
                yield _sse("error", {"error": "bad_request", "message": "Provide input or command.resume"})
                return

            # --- Stream events ---
            current_node = None

            async for event in event_source:
                event_type = event.get("event", "")

                # Custom tool_call events emitted by run_chat
                if event_type == "on_custom_event" and event.get("name") == "tool_call":
                    data = event.get("data", {})
                    tool_evt = {
                        "type": "tool_use",
                        "name": data.get("tool", "unknown"),
                        "preview": data.get("preview", ""),
                    }
                    yield _sse("messages/partial", [tool_evt])
                    continue

                # Track current node
                if event_type == "on_chain_start":
                    name = event.get("name", "")
                    if name in ("chat", "human_input"):
                        current_node = name

                # Chat node completed — send response + memory
                if event_type == "on_chain_end" and event.get("name") == "chat":
                    output = event.get("data", {}).get("output", {})
                    update = _extract_update(output)

                    chat_response = update.get("chat_response", "")
                    if chat_response:
                        yield _sse("messages/complete", [{
                            "type": "ai",
                            "content": chat_response,
                            "id": request_msg_id,
                        }])

                    memory = update.get("memory")
                    if memory:
                        yield _sse("metadata", {"memory": _make_serializable(memory)})

            # --- Final state ---
            state = skye_graph.get_state(config)
            if state and state.next:
                result = {
                    "memory": _make_serializable(state.values.get("memory", {})),
                    "chat_response": state.values.get("chat_response", ""),
                }
                yield _sse("interrupt", {"result": result})

            yield _sse("end", {"status": "complete"})

        except Exception as e:
            import traceback
            traceback.print_exc()
            yield _sse("error", {"error": str(e)})

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ---------------------------------------------------------------------------
# Thread management
# ---------------------------------------------------------------------------


@router.post("/threads")
async def create_thread(request: ThreadCreate):
    """Create a new conversation thread."""
    thread_id = request.thread_id or str(uuid.uuid4())
    return {"thread_id": thread_id}


@router.get("/threads/{thread_id}/state")
async def get_thread_state(thread_id: str):
    """Get the current state of a conversation thread."""
    config = {"configurable": {"thread_id": thread_id}}
    state = skye_graph.get_state(config)
    if not state:
        raise HTTPException(404, "Thread not found")
    return {
        "values": _make_serializable(state.values),
        "next": state.next,
    }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _sse(event_name: str, data) -> str:
    """Format a single SSE event."""
    return f"event: {event_name}\ndata: {json.dumps(data, default=str)}\n\n"


def _extract_update(output) -> dict:
    """Extract the update dict from a Command or plain dict output."""
    if hasattr(output, "update"):
        return output.update or {}
    if isinstance(output, dict):
        return output.get("update", output)
    return {}
