import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.models import Base


class LearningPath(Base):
    __tablename__ = "learning_paths"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    workspace_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("workspaces.id", ondelete="SET NULL"), index=True)
    title: Mapped[str]
    description: Mapped[str | None]
    objective: Mapped[str | None]
    difficulty: Mapped[str | None]
    estimated_duration: Mapped[str | None]
    time_per_week: Mapped[str | None]
    deadline: Mapped[str | None]
    status: Mapped[str] = mapped_column(default="active")
    total_steps: Mapped[int] = mapped_column(default=0)
    completed_steps: Mapped[int] = mapped_column(default=0)
    progress_percent: Mapped[float] = mapped_column(default=0.0)
    generated_by: Mapped[str] = mapped_column(default="agent")
    raw_agent_output: Mapped[str | None]
    chat_session_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("chat_sessions.id", ondelete="SET NULL"))
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    # Relationships
    workspace = relationship("Workspace", back_populates="learning_paths", lazy="selectin")
    steps: Mapped[list["LearningPathStep"]] = relationship(back_populates="learning_path", lazy="selectin")  # noqa: F821
