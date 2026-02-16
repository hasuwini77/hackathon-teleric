import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from database.models import Base


class ContentReview(Base):
    __tablename__ = "content_reviews"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    content_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("content.id", ondelete="CASCADE"), index=True)
    reviewer_type: Mapped[str]  # automated|human|compliance_agent
    status: Mapped[str] = mapped_column(default="pending")
    is_accessible: Mapped[bool | None]
    is_content_fresh: Mapped[bool | None]
    license_compliant: Mapped[bool | None]
    quality_score: Mapped[float | None]
    notes: Mapped[str | None]
    reviewed_at: Mapped[datetime | None]
    next_review_at: Mapped[datetime | None]
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
