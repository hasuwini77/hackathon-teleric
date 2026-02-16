"""Chat service — placeholder until the SKYE Agent is implemented.

`get_agent_response()` currently makes a raw OpenRouter call.  It will
be replaced by the full agent pipeline:
  1. Listen  — receive user message
  2. Think   — build dynamic system prompt from AgentMemory
  3. Extract — dual LLM call to update memory (skills, objective, etc.)
  4. Act     — schedule actions (save learning path, web search, etc.)

See lib/chat-agent.ts for the reference implementation to port.
"""
import uuid

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from database.models.chat_message import ChatMessage
from database.models.chat_session import ChatSession
from app.services.embedding_service import embed


async def add_message(
    db: AsyncSession,
    session_id: uuid.UUID,
    role: str,
    content: str,
    *,
    embed_content: bool = True,
) -> ChatMessage:
    # Get next message index
    result = await db.execute(
        select(ChatMessage.message_index)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.message_index.desc())
        .limit(1)
    )
    last_index = result.scalar()
    next_index = (last_index + 1) if last_index is not None else 0

    embedding = embed(content) if embed_content and role != "system" else None

    msg = ChatMessage(
        session_id=session_id,
        role=role,
        content=content,
        embedding=embedding,
        message_index=next_index,
    )
    db.add(msg)
    await db.flush()
    return msg


async def get_agent_response(
    db: AsyncSession,
    session: ChatSession,
    user_message: str,
) -> str:
    """Send conversation to OpenRouter and get agent response."""
    # Gather conversation history
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session.id)
        .order_by(ChatMessage.message_index)
    )
    messages = result.scalars().all()

    openrouter_messages = []
    for msg in messages:
        openrouter_messages.append({"role": msg.role, "content": msg.content})

    # Add the new user message
    openrouter_messages.append({"role": "user", "content": user_message})

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openrouter_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "google/gemini-2.0-flash-001",
                "messages": openrouter_messages,
            },
            timeout=60.0,
        )
        resp.raise_for_status()
        data = resp.json()

    return data["choices"][0]["message"]["content"]
