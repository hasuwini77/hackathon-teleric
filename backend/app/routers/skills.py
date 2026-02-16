import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from database.connection import get_db
from database.models.skill import Skill
from app.schemas.requests import SkillCreate
from app.schemas.responses import SkillResponse
from app.services.embedding_service import embed

router = APIRouter()


@router.get("/", response_model=list[SkillResponse])
async def list_skills(q: str | None = None, db: AsyncSession = Depends(get_db)):
    if q:
        # Full-text search
        result = await db.execute(
            text("SELECT * FROM skills WHERE to_tsvector('english', name) @@ plainto_tsquery('english', :q) ORDER BY name"),
            {"q": q},
        )
        return result.mappings().all()
    result = await db.execute(select(Skill).order_by(Skill.name))
    return result.scalars().all()


@router.post("/", response_model=SkillResponse, status_code=201)
async def create_skill(body: SkillCreate, db: AsyncSession = Depends(get_db)):
    desc = body.description or body.name
    embedding = embed(desc)
    skill = Skill(name=body.name, category=body.category, description=body.description, embedding=embedding)
    db.add(skill)
    await db.commit()
    await db.refresh(skill)
    return skill


@router.get("/search", response_model=list[SkillResponse])
async def search_skills_vector(q: str = Query(...), limit: int = 10, db: AsyncSession = Depends(get_db)):
    vec = embed(q)
    result = await db.execute(
        text("""
            SELECT id, name, category, description, created_at,
                   1 - (embedding <=> CAST(:vec AS vector)) AS score
            FROM skills
            WHERE embedding IS NOT NULL
            ORDER BY embedding <=> CAST(:vec AS vector)
            LIMIT :limit
        """),
        {"vec": str(vec), "limit": limit},
    )
    return result.mappings().all()
