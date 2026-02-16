import uuid

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.models import Base


class ContentSkill(Base):
    __tablename__ = "content_skills"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    content_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("content.id", ondelete="CASCADE"), index=True)
    skill_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("skills.id", ondelete="CASCADE"), index=True)

    # Relationships
    content = relationship("Content", back_populates="skills", lazy="selectin")
    skill = relationship("Skill", lazy="selectin")

    __table_args__ = (UniqueConstraint("content_id", "skill_id", name="uq_content_skill"),)
