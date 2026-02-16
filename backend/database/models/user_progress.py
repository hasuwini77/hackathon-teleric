import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from database.models import Base


class UserProgress(Base):
    __tablename__ = "user_progress"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    learning_path_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("learning_paths.id", ondelete="CASCADE"))
    step_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("learning_path_steps.id", ondelete="CASCADE"))
    content_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("content.id", ondelete="SET NULL"))
    status: Mapped[str] = mapped_column(default="not_started")
    completed_at: Mapped[datetime | None]
    time_spent_minutes: Mapped[int] = mapped_column(default=0)
    notes: Mapped[str | None]
    rating: Mapped[int | None]
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())
