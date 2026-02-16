import uuid
from datetime import datetime

from pgvector.sqlalchemy import Vector
from sqlalchemy import ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.models import Base


class Content(Base):
    __tablename__ = "content"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    # Core
    title: Mapped[str] = mapped_column(index=True)
    description: Mapped[str]
    embedding = mapped_column(Vector(384), nullable=True)
    content_type: Mapped[str]  # article|video|course|documentation|pdf|wiki
    source_type: Mapped[str]  # external|internal

    # External
    url: Mapped[str | None]
    provider: Mapped[str | None]

    # Internal
    file_path: Mapped[str | None]
    internal_url: Mapped[str | None]

    # Metadata
    duration: Mapped[str | None]
    difficulty: Mapped[str | None]
    language: Mapped[str] = mapped_column(default="en")
    author: Mapped[str | None]
    thumbnail_url: Mapped[str | None]

    # Tracking
    uploaded_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    content_created_at: Mapped[datetime | None]
    latest_verified_at: Mapped[datetime | None]
    verification_status: Mapped[str] = mapped_column(default="unverified")
    license_info: Mapped[str | None]

    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    # Relationships
    tags: Mapped[list["ContentTag"]] = relationship(back_populates="content", lazy="selectin")  # noqa: F821
    skills: Mapped[list["ContentSkill"]] = relationship(back_populates="content", lazy="selectin")  # noqa: F821
