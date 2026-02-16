import uuid
from datetime import datetime

from pgvector.sqlalchemy import Vector
from sqlalchemy import ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.models import Base


class Workspace(Base):
    __tablename__ = "workspaces"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str]
    description: Mapped[str | None]
    objective: Mapped[str | None]
    objective_embedding = mapped_column(Vector(384), nullable=True)
    status: Mapped[str] = mapped_column(default="active")
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="workspaces", lazy="selectin")
    skills: Mapped[list["WorkspaceSkill"]] = relationship(back_populates="workspace", lazy="selectin")  # noqa: F821
    content_links: Mapped[list["WorkspaceContent"]] = relationship(back_populates="workspace", lazy="selectin")  # noqa: F821
    sessions: Mapped[list["ChatSession"]] = relationship(back_populates="workspace", lazy="selectin")  # noqa: F821
    learning_paths: Mapped[list["LearningPath"]] = relationship(back_populates="workspace", lazy="selectin")  # noqa: F821
