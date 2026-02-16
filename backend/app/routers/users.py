import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.connection import get_db
from database.models.user import User
from database.models.user_skill import UserSkill
from database.models.skill import Skill
from app.schemas.requests import UserCreate, UserUpdate, UserSkillAdd
from app.schemas.responses import UserResponse, UserSkillResponse

router = APIRouter()


@router.post("/", response_model=UserResponse, status_code=201)
async def create_user(body: UserCreate, db: AsyncSession = Depends(get_db)):
    user = User(**body.model_dump())
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return user


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(user_id: uuid.UUID, body: UserUpdate, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    for key, val in body.model_dump(exclude_unset=True).items():
        setattr(user, key, val)
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/{user_id}/cv", response_model=UserResponse)
async def upload_cv(user_id: uuid.UUID, file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")

    import os
    upload_dir = "uploads/cv"
    os.makedirs(upload_dir, exist_ok=True)
    path = f"{upload_dir}/{user_id}_{file.filename}"
    with open(path, "wb") as f:
        content = await file.read()
        f.write(content)

    user.cv_file_path = path
    await db.commit()
    await db.refresh(user)
    return user


@router.get("/{user_id}/skills", response_model=list[UserSkillResponse])
async def get_user_skills(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(UserSkill).where(UserSkill.user_id == user_id)
    )
    return result.scalars().all()


@router.post("/{user_id}/skills", response_model=UserSkillResponse, status_code=201)
async def add_user_skill(user_id: uuid.UUID, body: UserSkillAdd, db: AsyncSession = Depends(get_db)):
    # Verify user and skill exist
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    skill = await db.get(Skill, body.skill_id)
    if not skill:
        raise HTTPException(404, "Skill not found")

    us = UserSkill(user_id=user_id, skill_id=body.skill_id, level=body.level, source=body.source)
    db.add(us)
    await db.commit()
    await db.refresh(us)
    return us


@router.delete("/{user_id}/skills/{skill_id}", status_code=204)
async def remove_user_skill(user_id: uuid.UUID, skill_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(UserSkill).where(UserSkill.user_id == user_id, UserSkill.skill_id == skill_id)
    )
    us = result.scalar_one_or_none()
    if not us:
        raise HTTPException(404, "User skill not found")
    await db.delete(us)
    await db.commit()
