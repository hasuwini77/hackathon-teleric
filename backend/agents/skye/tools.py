"""LLM-callable tools for the SKYE agent.

These tools are bound to the chat LLM so it can search content and skills
from the database during conversation.
"""

import json

from langchain_core.tools import tool
from sqlalchemy import text


@tool
async def search_content(
    query: str,
    difficulty: str | None = None,
    limit: int = 5,
) -> str:
    """Search for learning content (articles, courses, videos, documentation) using semantic search.

    Use this when you want to recommend specific resources to the user.

    Args:
        query: Natural language search query describing the topic.
        difficulty: Optional filter — "beginner", "intermediate", or "advanced".
        limit: Max results to return (default 5).
    """
    from app.services.embedding_service import embed
    from database.connection import async_session_factory

    vec = embed(query)
    params: dict = {"vec": str(vec), "limit": limit}

    difficulty_filter = ""
    if difficulty:
        difficulty_filter = "AND c.difficulty = :difficulty"
        params["difficulty"] = difficulty

    async with async_session_factory() as db:
        result = await db.execute(
            text(f"""
                SELECT c.id, c.title, c.description, c.content_type,
                       c.source_type, c.difficulty, c.url, c.duration,
                       c.provider,
                       1 - (c.embedding <=> CAST(:vec AS vector)) AS score
                FROM content c
                WHERE c.embedding IS NOT NULL {difficulty_filter}
                ORDER BY c.embedding <=> CAST(:vec AS vector)
                LIMIT :limit
            """),
            params,
        )
        rows = result.mappings().all()

    if not rows:
        return json.dumps({"results": [], "message": "No content found."})

    results = []
    for r in rows:
        results.append({
            "title": r["title"],
            "description": r["description"][:200],
            "type": r["content_type"],
            "source": r["source_type"],
            "difficulty": r["difficulty"],
            "url": r["url"],
            "duration": r["duration"],
            "provider": r["provider"],
            "relevance": round(float(r["score"]), 3),
        })

    return json.dumps({"results": results})


@tool
async def search_skills(query: str, limit: int = 10) -> str:
    """Search for recognized skills by name using semantic search.

    Use this to look up specific skills when mapping the user's abilities
    or identifying what skills a learning path should cover.

    Args:
        query: Skill name or topic to search for.
        limit: Max results (default 10).
    """
    from app.services.embedding_service import embed
    from database.connection import async_session_factory

    vec = embed(query)

    async with async_session_factory() as db:
        result = await db.execute(
            text("""
                SELECT id, name, category,
                       1 - (embedding <=> CAST(:vec AS vector)) AS score
                FROM skills
                WHERE embedding IS NOT NULL
                ORDER BY embedding <=> CAST(:vec AS vector)
                LIMIT :limit
            """),
            {"vec": str(vec), "limit": limit},
        )
        rows = result.mappings().all()

    results = [
        {
            "name": r["name"],
            "category": r["category"],
            "relevance": round(float(r["score"]), 3),
        }
        for r in rows
    ]

    return json.dumps({"skills": results})


# All tools exposed to the chat LLM
SKYE_TOOLS = [search_content, search_skills]
