import uuid
from datetime import datetime

from pgvector.sqlalchemy import Vector
from sqlalchemy import func
from sqlalchemy.orm import Mapped, mapped_column

from database.models import Base


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(unique=True, index=True)
    category: Mapped[str | None]
    description: Mapped[str | None]
    embedding = mapped_column(Vector(384), nullable=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
