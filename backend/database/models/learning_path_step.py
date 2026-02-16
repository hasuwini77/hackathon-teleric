import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.models import Base


class LearningPathStep(Base):
    __tablename__ = "learning_path_steps"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    learning_path_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("learning_paths.id", ondelete="CASCADE"), index=True)
    content_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("content.id", ondelete="SET NULL"))
    step_number: Mapped[int]
    title: Mapped[str]
    description: Mapped[str | None]
    step_type: Mapped[str] = mapped_column(default="resource")
    status: Mapped[str] = mapped_column(default="locked")
    duration: Mapped[str | None]
    url: Mapped[str | None]
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    # Relationships
    learning_path = relationship("LearningPath", back_populates="steps", lazy="selectin")
