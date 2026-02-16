"""Chat router — DISABLED, pending agent-based replacement.

This router is NOT registered in main.py. It will be replaced by an
agentic architecture that handles:
  - Multi-turn conversations with memory (AgentMemory)
  - Extraction pipeline (skills, objective, background, etc.)
  - Action scheduling (SAVE_LEARNING_PATH, SEARCH_WEB, SEND_TO_BACKEND)
  - Auto-assignment of sessions to workspaces

Setup when ready:
  1. Build the SKYE Agent (Python) that wraps the LLM call with
     extraction + action logic (port lib/chat-agent.ts → Python).
  2. Replace `get_agent_response()` in chat_service.py with the agent.
  3. Re-enable in main.py:
       from app.routers import chat
       app.include_router(chat.router, prefix="/api/chat", tags=["chat"])

Existing models used: ChatSession, ChatMessage (database/models/).
Existing service:     chat_service.py (app/services/).
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.connection import get_db
from database.models.chat_session import ChatSession
from database.models.chat_message import ChatMessage
from app.schemas.requests import ChatSessionCreate, ChatSessionUpdate, ChatMessageCreate, ChatRespondRequest
from app.schemas.responses import ChatSessionResponse, ChatSessionDetailResponse, ChatMessageResponse
from app.services.chat_service import add_message, get_agent_response
from app.services.workspace_service import find_or_create_workspace

router = APIRouter()


@router.get("/sessions", response_model=list[ChatSessionResponse])
async def list_sessions(user_id: uuid.UUID = Query(...), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ChatSession).where(ChatSession.user_id == user_id).order_by(ChatSession.updated_at.desc())
    )
    return result.scalars().all()


@router.post("/sessions", response_model=ChatSessionResponse, status_code=201)
async def create_session(body: ChatSessionCreate, db: AsyncSession = Depends(get_db)):
    session = ChatSession(
        user_id=body.user_id,
        workspace_id=body.workspace_id,
        title=body.title,
        objective=body.objective,
    )
    db.add(session)

    # Auto-assign to workspace if objective provided and no workspace specified
    if body.objective and not body.workspace_id:
        ws = await find_or_create_workspace(db, body.user_id, body.objective, session_title=body.title)
        session.workspace_id = ws.id

    await db.commit()
    await db.refresh(session)
    return session


@router.get("/sessions/{session_id}", response_model=ChatSessionDetailResponse)
async def get_session(session_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    session = await db.get(ChatSession, session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    return session


@router.patch("/sessions/{session_id}", response_model=ChatSessionResponse)
async def update_session(session_id: uuid.UUID, body: ChatSessionUpdate, db: AsyncSession = Depends(get_db)):
    session = await db.get(ChatSession, session_id)
    if not session:
        raise HTTPException(404, "Session not found")

    data = body.model_dump(exclude_unset=True)
    for key, val in data.items():
        setattr(session, key, val)

    # Auto-assign to workspace if objective was just set
    if "objective" in data and data["objective"] and not session.workspace_id:
        ws = await find_or_create_workspace(db, session.user_id, data["objective"], session_title=session.title)
        session.workspace_id = ws.id

    await db.commit()
    await db.refresh(session)
    return session


@router.get("/sessions/{session_id}/messages", response_model=list[ChatMessageResponse])
async def get_messages(session_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.message_index)
    )
    return result.scalars().all()


@router.post("/sessions/{session_id}/messages", response_model=ChatMessageResponse, status_code=201)
async def create_message(session_id: uuid.UUID, body: ChatMessageCreate, db: AsyncSession = Depends(get_db)):
    session = await db.get(ChatSession, session_id)
    if not session:
        raise HTTPException(404, "Session not found")

    msg = await add_message(db, session_id, body.role, body.content)
    await db.commit()
    await db.refresh(msg)
    return msg


@router.post("/sessions/{session_id}/respond", response_model=ChatMessageResponse)
async def respond(session_id: uuid.UUID, body: ChatRespondRequest, db: AsyncSession = Depends(get_db)):
    session = await db.get(ChatSession, session_id)
    if not session:
        raise HTTPException(404, "Session not found")

    # Save user message
    await add_message(db, session_id, "user", body.content)

    # Get agent response
    assistant_text = await get_agent_response(db, session, body.content)

    # Save assistant message
    assistant_msg = await add_message(db, session_id, "assistant", assistant_text)

    # Auto-set title from first user message
    if not session.title:
        session.title = body.content[:100]

    await db.commit()
    await db.refresh(assistant_msg)
    return assistant_msg
