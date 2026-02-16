import uuid
from datetime import datetime

from sqlalchemy import JSON, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.models import Base


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    workspace_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("workspaces.id", ondelete="SET NULL"), index=True)
    title: Mapped[str | None]
    # Agent memory snapshot
    objective: Mapped[str | None]
    relevant_experience: Mapped[str | None]
    background: Mapped[str | None]
    relevant_skills: Mapped[list | None] = mapped_column(JSON, nullable=True)
    required_skills: Mapped[list | None] = mapped_column(JSON, nullable=True)
    interests: Mapped[list | None] = mapped_column(JSON, nullable=True)
    time_per_week: Mapped[str | None]
    deadline: Mapped[str | None]
    learning_path_created: Mapped[bool] = mapped_column(default=False)
    status: Mapped[str] = mapped_column(default="active")
    learning_path_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("learning_paths.id", ondelete="SET NULL"))
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    # Relationships
    workspace = relationship("Workspace", back_populates="sessions", lazy="selectin")
    messages: Mapped[list["ChatMessage"]] = relationship(back_populates="session", lazy="selectin", order_by="ChatMessage.message_index")  # noqa: F821
