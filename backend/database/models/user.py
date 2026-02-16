import uuid
from datetime import datetime

from sqlalchemy import JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.models import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(unique=True, index=True)
    name: Mapped[str]
    role: Mapped[str | None]
    location: Mapped[str | None]
    linkedin_url: Mapped[str | None]
    cv_file_path: Mapped[str | None]
    avatar_url: Mapped[str | None]
    experience_summary: Mapped[str | None]
    learning_style: Mapped[str | None]
    preferences: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    # Relationships
    skills: Mapped[list["UserSkill"]] = relationship(back_populates="user", lazy="selectin")  # noqa: F821
    workspaces: Mapped[list["Workspace"]] = relationship(back_populates="user", lazy="selectin")  # noqa: F821
