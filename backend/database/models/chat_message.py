import uuid
from datetime import datetime

from pgvector.sqlalchemy import Vector
from sqlalchemy import JSON, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.models import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("chat_sessions.id", ondelete="CASCADE"), index=True)
    role: Mapped[str]  # system|user|assistant
    content: Mapped[str]
    embedding = mapped_column(Vector(384), nullable=True)
    message_index: Mapped[int] = mapped_column(default=0)
    extracted_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    action_triggered: Mapped[str | None]
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    # Relationships
    session = relationship("ChatSession", back_populates="messages", lazy="selectin")
