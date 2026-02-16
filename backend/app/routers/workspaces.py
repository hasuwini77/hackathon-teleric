import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.connection import get_db
from database.models.workspace import Workspace
from database.models.workspace_skill import WorkspaceSkill
from database.models.workspace_content import WorkspaceContent
from database.models.chat_session import ChatSession
from app.schemas.requests import (
    WorkspaceCreate, WorkspaceUpdate,
    WorkspaceSkillAdd, WorkspaceSkillUpdate,
    WorkspaceContentAdd,
)
from app.schemas.responses import (
    WorkspaceResponse, WorkspaceDetailResponse,
    WorkspaceSkillResponse, WorkspaceContentResponse,
    ChatSessionResponse,
)
from app.services.embedding_service import embed
from app.services.workspace_service import find_or_create_workspace

router = APIRouter()


@router.get("/", response_model=list[WorkspaceResponse])
async def list_workspaces(user_id: uuid.UUID = Query(...), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Workspace).where(Workspace.user_id == user_id).order_by(Workspace.updated_at.desc())
    )
    return result.scalars().all()


@router.post("/", response_model=WorkspaceResponse, status_code=201)
async def create_workspace(body: WorkspaceCreate, db: AsyncSession = Depends(get_db)):
    obj_embedding = embed(body.objective) if body.objective else None
    ws = Workspace(
        user_id=body.user_id,
        name=body.name,
        description=body.description,
        objective=body.objective,
        objective_embedding=obj_embedding,
    )
    db.add(ws)
    await db.commit()
    await db.refresh(ws)
    return ws


@router.get("/{workspace_id}", response_model=WorkspaceDetailResponse)
async def get_workspace(workspace_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    ws = await db.get(Workspace, workspace_id)
    if not ws:
        raise HTTPException(404, "Workspace not found")
    return ws


@router.patch("/{workspace_id}", response_model=WorkspaceResponse)
async def update_workspace(workspace_id: uuid.UUID, body: WorkspaceUpdate, db: AsyncSession = Depends(get_db)):
    ws = await db.get(Workspace, workspace_id)
    if not ws:
        raise HTTPException(404, "Workspace not found")

    data = body.model_dump(exclude_unset=True)
    for key, val in data.items():
        setattr(ws, key, val)

    if "objective" in data and data["objective"]:
        ws.objective_embedding = embed(data["objective"])

    await db.commit()
    await db.refresh(ws)
    return ws


@router.delete("/{workspace_id}", status_code=204)
async def archive_workspace(workspace_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    ws = await db.get(Workspace, workspace_id)
    if not ws:
        raise HTTPException(404, "Workspace not found")
    ws.status = "archived"
    await db.commit()


# --- Workspace Skills ---
@router.get("/{workspace_id}/skills", response_model=list[WorkspaceSkillResponse])
async def get_workspace_skills(workspace_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(WorkspaceSkill).where(WorkspaceSkill.workspace_id == workspace_id)
    )
    return result.scalars().all()


@router.post("/{workspace_id}/skills", response_model=WorkspaceSkillResponse, status_code=201)
async def add_workspace_skill(workspace_id: uuid.UUID, body: WorkspaceSkillAdd, db: AsyncSession = Depends(get_db)):
    ws_skill = WorkspaceSkill(
        workspace_id=workspace_id,
        skill_id=body.skill_id,
        status=body.status,
        level_at_start=body.level_at_start,
        source=body.source,
    )
    db.add(ws_skill)
    await db.commit()
    await db.refresh(ws_skill)
    return ws_skill


@router.patch("/{workspace_id}/skills/{ws_skill_id}", response_model=WorkspaceSkillResponse)
async def update_workspace_skill(
    workspace_id: uuid.UUID, ws_skill_id: uuid.UUID, body: WorkspaceSkillUpdate, db: AsyncSession = Depends(get_db),
):
    ws_skill = await db.get(WorkspaceSkill, ws_skill_id)
    if not ws_skill or ws_skill.workspace_id != workspace_id:
        raise HTTPException(404, "Workspace skill not found")
    for key, val in body.model_dump(exclude_unset=True).items():
        setattr(ws_skill, key, val)
    await db.commit()
    await db.refresh(ws_skill)
    return ws_skill


# --- Workspace Content ---
@router.get("/{workspace_id}/content", response_model=list[WorkspaceContentResponse])
async def get_workspace_content(workspace_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(WorkspaceContent).where(WorkspaceContent.workspace_id == workspace_id).order_by(WorkspaceContent.order)
    )
    return result.scalars().all()


@router.post("/{workspace_id}/content", response_model=WorkspaceContentResponse, status_code=201)
async def link_content_to_workspace(
    workspace_id: uuid.UUID, body: WorkspaceContentAdd, db: AsyncSession = Depends(get_db),
):
    wc = WorkspaceContent(
        workspace_id=workspace_id,
        content_id=body.content_id,
        added_by=body.added_by,
        order=body.order,
    )
    db.add(wc)
    await db.commit()
    await db.refresh(wc)
    return wc


# --- Workspace Sessions ---
@router.get("/{workspace_id}/sessions", response_model=list[ChatSessionResponse])
async def get_workspace_sessions(workspace_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ChatSession).where(ChatSession.workspace_id == workspace_id).order_by(ChatSession.created_at.desc())
    )
    return result.scalars().all()


# --- Auto-match ---
@router.post("/{workspace_id}/match")
async def trigger_auto_match(workspace_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Auto-match unassigned sessions to this workspace."""
    ws = await db.get(Workspace, workspace_id)
    if not ws:
        raise HTTPException(404, "Workspace not found")

    # Find unassigned sessions for this user
    result = await db.execute(
        select(ChatSession).where(
            ChatSession.user_id == ws.user_id,
            ChatSession.workspace_id.is_(None),
            ChatSession.objective.isnot(None),
        )
    )
    unassigned = result.scalars().all()
    matched = 0

    for session in unassigned:
        if session.objective:
            matched_ws = await find_or_create_workspace(
                db, ws.user_id, session.objective, session_title=session.title,
            )
            session.workspace_id = matched_ws.id
            matched += 1

    await db.commit()
    return {"matched": matched}
