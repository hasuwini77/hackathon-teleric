import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.models import Base


class WorkspaceContent(Base):
    __tablename__ = "workspace_content"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("workspaces.id", ondelete="CASCADE"), index=True)
    content_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("content.id", ondelete="CASCADE"), index=True)
    added_by: Mapped[str] = mapped_column(default="agent")
    status: Mapped[str] = mapped_column(default="pending")
    order: Mapped[int | None]
    completed_at: Mapped[datetime | None]
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    # Relationships
    workspace = relationship("Workspace", back_populates="content_links", lazy="selectin")
    content = relationship("Content", lazy="selectin")
