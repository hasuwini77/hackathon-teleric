import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.connection import get_db
from database.models.user_progress import UserProgress
from app.schemas.requests import ProgressCreate, ProgressUpdate
from app.schemas.responses import UserProgressResponse

router = APIRouter()


@router.get("/", response_model=list[UserProgressResponse])
async def list_progress(
    user_id: uuid.UUID = Query(...),
    path_id: uuid.UUID | None = None,
    db: AsyncSession = Depends(get_db),
):
    q = select(UserProgress).where(UserProgress.user_id == user_id)
    if path_id:
        q = q.where(UserProgress.learning_path_id == path_id)
    q = q.order_by(UserProgress.created_at.desc())
    result = await db.execute(q)
    return result.scalars().all()


@router.post("/", response_model=UserProgressResponse, status_code=201)
async def create_progress(body: ProgressCreate, db: AsyncSession = Depends(get_db)):
    progress = UserProgress(**body.model_dump())
    db.add(progress)
    await db.commit()
    await db.refresh(progress)
    return progress


@router.patch("/{progress_id}", response_model=UserProgressResponse)
async def update_progress(progress_id: uuid.UUID, body: ProgressUpdate, db: AsyncSession = Depends(get_db)):
    progress = await db.get(UserProgress, progress_id)
    if not progress:
        raise HTTPException(404, "Progress entry not found")
    for key, val in body.model_dump(exclude_unset=True).items():
        setattr(progress, key, val)
    await db.commit()
    await db.refresh(progress)
    return progress
