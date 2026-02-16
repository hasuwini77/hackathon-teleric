import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.models.content import Content
from database.models.content_skill import ContentSkill
from database.models.content_tag import ContentTag
from app.services.embedding_service import embed


async def create_content(
    db: AsyncSession,
    *,
    title: str,
    description: str,
    content_type: str,
    source_type: str,
    url: str | None = None,
    provider: str | None = None,
    file_path: str | None = None,
    internal_url: str | None = None,
    duration: str | None = None,
    difficulty: str | None = None,
    language: str = "en",
    author: str | None = None,
    thumbnail_url: str | None = None,
    uploaded_by: uuid.UUID | None = None,
    license_info: str | None = None,
    skill_ids: list[uuid.UUID] | None = None,
    tags: list[str] | None = None,
) -> Content:
    embedding = embed(f"{title} {description}")

    content = Content(
        title=title,
        description=description,
        embedding=embedding,
        content_type=content_type,
        source_type=source_type,
        url=url,
        provider=provider,
        file_path=file_path,
        internal_url=internal_url,
        duration=duration,
        difficulty=difficulty,
        language=language,
        author=author,
        thumbnail_url=thumbnail_url,
        uploaded_by=uploaded_by,
        license_info=license_info,
    )
    db.add(content)
    await db.flush()

    if skill_ids:
        for sid in skill_ids:
            db.add(ContentSkill(content_id=content.id, skill_id=sid))

    if tags:
        for tag in tags:
            db.add(ContentTag(content_id=content.id, tag=tag))

    await db.flush()
    return content


async def update_content_embedding(db: AsyncSession, content: Content) -> None:
    content.embedding = embed(f"{content.title} {content.description}")
    await db.flush()
