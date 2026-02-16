import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from database.connection import get_db
from app.schemas.responses import ContentSearchResult
from app.services.embedding_service import embed

router = APIRouter()


@router.get("/content", response_model=list[ContentSearchResult])
async def search_content(
    q: str = Query(...),
    type: str = Query("hybrid", pattern="^(hybrid|vector|fts)$"),
    difficulty: str | None = None,
    source_type: str | None = None,
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
):
    filters = []
    params: dict = {"limit": limit}

    if difficulty:
        filters.append("c.difficulty = :difficulty")
        params["difficulty"] = difficulty
    if source_type:
        filters.append("c.source_type = :source_type")
        params["source_type"] = source_type

    where_clause = (" AND " + " AND ".join(filters)) if filters else ""

    if type == "vector":
        vec = embed(q)
        params["vec"] = str(vec)
        sql = f"""
            SELECT c.id, c.title, c.description, c.content_type, c.source_type,
                   c.difficulty, c.url,
                   1 - (c.embedding <=> CAST(:vec AS vector)) AS score
            FROM content c
            WHERE c.embedding IS NOT NULL{where_clause}
            ORDER BY c.embedding <=> CAST(:vec AS vector)
            LIMIT :limit
        """
    elif type == "fts":
        params["q"] = q
        sql = f"""
            SELECT c.id, c.title, c.description, c.content_type, c.source_type,
                   c.difficulty, c.url,
                   ts_rank(to_tsvector('english', c.title || ' ' || c.description), plainto_tsquery('english', :q)) AS score
            FROM content c
            WHERE to_tsvector('english', c.title || ' ' || c.description) @@ plainto_tsquery('english', :q){where_clause}
            ORDER BY score DESC
            LIMIT :limit
        """
    else:
        # Hybrid: combine vector + FTS scores
        vec = embed(q)
        params["vec"] = str(vec)
        params["q"] = q
        sql = f"""
            SELECT c.id, c.title, c.description, c.content_type, c.source_type,
                   c.difficulty, c.url,
                   (
                     0.7 * (1 - (c.embedding <=> CAST(:vec AS vector))) +
                     0.3 * COALESCE(ts_rank(to_tsvector('english', c.title || ' ' || c.description), plainto_tsquery('english', :q)), 0)
                   ) AS score
            FROM content c
            WHERE c.embedding IS NOT NULL{where_clause}
            ORDER BY score DESC
            LIMIT :limit
        """

    result = await db.execute(text(sql), params)
    return result.mappings().all()


@router.get("/skills")
async def search_skills(
    q: str = Query(...),
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
):
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


@router.get("/messages")
async def search_messages(
    q: str = Query(...),
    session_id: uuid.UUID | None = None,
    limit: int = 5,
    db: AsyncSession = Depends(get_db),
):
    vec = embed(q)
    params: dict = {"vec": str(vec), "limit": limit}

    session_filter = ""
    if session_id:
        session_filter = "AND session_id = :session_id"
        params["session_id"] = session_id

    result = await db.execute(
        text(f"""
            SELECT id, session_id, role, content, message_index, created_at,
                   1 - (embedding <=> CAST(:vec AS vector)) AS score
            FROM chat_messages
            WHERE embedding IS NOT NULL {session_filter}
            ORDER BY embedding <=> CAST(:vec AS vector)
            LIMIT :limit
        """),
        params,
    )
    return result.mappings().all()
