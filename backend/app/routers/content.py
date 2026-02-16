import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.connection import get_db
from database.models.content import Content
from database.models.content_tag import ContentTag
from database.models.content_skill import ContentSkill
from app.schemas.requests import ContentCreate, ContentUpdate, TagAdd
from app.schemas.responses import ContentResponse, ContentTagResponse
from app.services.content_service import create_content, update_content_embedding

router = APIRouter()


@router.get("/", response_model=list[ContentResponse])
async def list_content(
    source_type: str | None = None,
    content_type: str | None = None,
    difficulty: str | None = None,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    q = select(Content)
    if source_type:
        q = q.where(Content.source_type == source_type)
    if content_type:
        q = q.where(Content.content_type == content_type)
    if difficulty:
        q = q.where(Content.difficulty == difficulty)
    q = q.order_by(Content.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(q)
    return result.scalars().all()


@router.post("/", response_model=ContentResponse, status_code=201)
async def create_content_endpoint(body: ContentCreate, db: AsyncSession = Depends(get_db)):
    content = await create_content(db, **body.model_dump())
    await db.commit()
    await db.refresh(content)
    return content


@router.get("/{content_id}", response_model=ContentResponse)
async def get_content(content_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    content = await db.get(Content, content_id)
    if not content:
        raise HTTPException(404, "Content not found")
    return content


@router.patch("/{content_id}", response_model=ContentResponse)
async def update_content(content_id: uuid.UUID, body: ContentUpdate, db: AsyncSession = Depends(get_db)):
    content = await db.get(Content, content_id)
    if not content:
        raise HTTPException(404, "Content not found")

    data = body.model_dump(exclude_unset=True)
    description_changed = "description" in data or "title" in data
    for key, val in data.items():
        setattr(content, key, val)

    if description_changed:
        await update_content_embedding(db, content)

    await db.commit()
    await db.refresh(content)
    return content


@router.delete("/{content_id}", status_code=204)
async def delete_content(content_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    content = await db.get(Content, content_id)
    if not content:
        raise HTTPException(404, "Content not found")
    await db.delete(content)
    await db.commit()


@router.post("/{content_id}/tags", response_model=ContentTagResponse, status_code=201)
async def add_tag(content_id: uuid.UUID, body: TagAdd, db: AsyncSession = Depends(get_db)):
    content = await db.get(Content, content_id)
    if not content:
        raise HTTPException(404, "Content not found")
    tag = ContentTag(content_id=content_id, tag=body.tag)
    db.add(tag)
    await db.commit()
    await db.refresh(tag)
    return tag


@router.delete("/{content_id}/tags/{tag_id}", status_code=204)
async def remove_tag(content_id: uuid.UUID, tag_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    tag = await db.get(ContentTag, tag_id)
    if not tag or tag.content_id != content_id:
        raise HTTPException(404, "Tag not found")
    await db.delete(tag)
    await db.commit()
