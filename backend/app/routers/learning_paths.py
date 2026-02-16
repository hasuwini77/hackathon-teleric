import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.connection import get_db
from database.models.learning_path import LearningPath
from database.models.learning_path_step import LearningPathStep
from app.schemas.requests import (
    LearningPathCreate, LearningPathUpdate,
    LearningPathStepCreate, LearningPathStepUpdate,
)
from app.schemas.responses import LearningPathResponse, LearningPathDetailResponse, LearningPathStepResponse
from app.services.learning_path_service import update_path_progress

router = APIRouter()


@router.get("/", response_model=list[LearningPathResponse])
async def list_paths(user_id: uuid.UUID = Query(...), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(LearningPath).where(LearningPath.user_id == user_id).order_by(LearningPath.created_at.desc())
    )
    return result.scalars().all()


@router.post("/", response_model=LearningPathResponse, status_code=201)
async def create_path(body: LearningPathCreate, db: AsyncSession = Depends(get_db)):
    path = LearningPath(**body.model_dump())
    db.add(path)
    await db.commit()
    await db.refresh(path)
    return path


@router.get("/{path_id}", response_model=LearningPathDetailResponse)
async def get_path(path_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    path = await db.get(LearningPath, path_id)
    if not path:
        raise HTTPException(404, "Learning path not found")
    return path


@router.patch("/{path_id}", response_model=LearningPathResponse)
async def update_path(path_id: uuid.UUID, body: LearningPathUpdate, db: AsyncSession = Depends(get_db)):
    path = await db.get(LearningPath, path_id)
    if not path:
        raise HTTPException(404, "Learning path not found")
    for key, val in body.model_dump(exclude_unset=True).items():
        setattr(path, key, val)
    await db.commit()
    await db.refresh(path)
    return path


@router.get("/{path_id}/steps", response_model=list[LearningPathStepResponse])
async def list_steps(path_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(LearningPathStep)
        .where(LearningPathStep.learning_path_id == path_id)
        .order_by(LearningPathStep.step_number)
    )
    return result.scalars().all()


@router.post("/{path_id}/steps", response_model=LearningPathStepResponse, status_code=201)
async def create_step(path_id: uuid.UUID, body: LearningPathStepCreate, db: AsyncSession = Depends(get_db)):
    path = await db.get(LearningPath, path_id)
    if not path:
        raise HTTPException(404, "Learning path not found")

    step = LearningPathStep(learning_path_id=path_id, **body.model_dump())
    db.add(step)
    await db.flush()

    # Update path progress counts
    await update_path_progress(db, path_id)

    await db.commit()
    await db.refresh(step)
    return step


@router.patch("/{path_id}/steps/{step_id}", response_model=LearningPathStepResponse)
async def update_step(
    path_id: uuid.UUID, step_id: uuid.UUID, body: LearningPathStepUpdate, db: AsyncSession = Depends(get_db),
):
    step = await db.get(LearningPathStep, step_id)
    if not step or step.learning_path_id != path_id:
        raise HTTPException(404, "Step not found")

    for key, val in body.model_dump(exclude_unset=True).items():
        setattr(step, key, val)

    await db.flush()
    await update_path_progress(db, path_id)

    await db.commit()
    await db.refresh(step)
    return step
