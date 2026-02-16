import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.models.learning_path import LearningPath
from database.models.learning_path_step import LearningPathStep


async def update_path_progress(db: AsyncSession, path_id: uuid.UUID) -> LearningPath:
    path = await db.get(LearningPath, path_id)
    if not path:
        raise ValueError(f"Learning path {path_id} not found")

    result = await db.execute(
        select(LearningPathStep).where(LearningPathStep.learning_path_id == path_id)
    )
    steps = result.scalars().all()

    total = len(steps)
    completed = sum(1 for s in steps if s.status == "completed")

    path.total_steps = total
    path.completed_steps = completed
    path.progress_percent = (completed / total * 100) if total > 0 else 0.0

    if completed == total and total > 0:
        path.status = "completed"

    await db.flush()
    return path
