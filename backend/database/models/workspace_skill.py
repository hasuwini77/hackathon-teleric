import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.models import Base


class WorkspaceSkill(Base):
    __tablename__ = "workspace_skills"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("workspaces.id", ondelete="CASCADE"), index=True)
    skill_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("skills.id", ondelete="CASCADE"), index=True)
    status: Mapped[str] = mapped_column(default="target")
    level_at_start: Mapped[str | None]
    level_current: Mapped[str | None]
    source: Mapped[str | None]
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    # Relationships
    workspace = relationship("Workspace", back_populates="skills", lazy="selectin")
    skill = relationship("Skill", lazy="selectin")

    __table_args__ = (UniqueConstraint("workspace_id", "skill_id", name="uq_workspace_skill"),)
