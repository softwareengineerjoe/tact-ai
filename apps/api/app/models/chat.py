"""Chat aggregate: sessions, messages, tool executions, citations (MASTER 15.8).

TACT AI stores the auditable, application-visible conversation record even when
Microsoft Foundry manages the runtime conversation. Sprint 5 is read-only: the
assistant answers questions over authorized structured data (MASTER 30, Phase
1). Write-action proposals arrive in a later phase.
"""

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import MessageRole
from app.models.base import Base

if TYPE_CHECKING:
    pass


class ChatSession(Base):
    """A single assistant conversation, owned by the user who started it."""

    __tablename__ = "chat_sessions"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False, default="New conversation")
    # Foundry runtime conversation id, when a managed provider was used.
    foundry_conversation_id: Mapped[str | None] = mapped_column(String(128), nullable=True)

    messages: Mapped[list[ChatMessage]] = relationship(
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="ChatMessage.created_at",
    )

    __table_args__ = (
        Index("ix_chat_sessions_org", "organization_id"),
        Index("ix_chat_sessions_user", "user_id"),
    )


class ChatMessage(Base):
    """A user or assistant turn in a session (MASTER 15.8)."""

    __tablename__ = "chat_messages"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("chat_sessions.id"), nullable=False
    )
    role: Mapped[str] = mapped_column(String(16), nullable=False, default=MessageRole.USER)
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # Auditable AI metadata (MASTER 15.7, 15.8). Model/prompt version and the
    # structured response envelope are captured for assistant turns.
    model_version: Mapped[str | None] = mapped_column(String(64), nullable=True)
    prompt_version: Mapped[str | None] = mapped_column(String(32), nullable=True)
    reasoning_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    warnings: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)
    suggested_next_action: Mapped[str | None] = mapped_column(Text, nullable=True)
    token_usage: Mapped[int | None] = mapped_column(Integer, nullable=True)

    session: Mapped[ChatSession] = relationship(back_populates="messages")
    tool_executions: Mapped[list[AIToolExecution]] = relationship(
        back_populates="message",
        cascade="all, delete-orphan",
        order_by="AIToolExecution.created_at",
    )
    citations: Mapped[list[MessageCitation]] = relationship(
        back_populates="message",
        cascade="all, delete-orphan",
        order_by="MessageCitation.created_at",
    )

    __table_args__ = (
        Index("ix_chat_messages_org", "organization_id"),
        Index("ix_chat_messages_session", "session_id"),
    )


class AIToolExecution(Base):
    """A recorded read-only tool call the orchestrator made (MASTER 15.8, 28)."""

    __tablename__ = "ai_tool_executions"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    message_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("chat_messages.id"), nullable=False
    )
    tool_name: Mapped[str] = mapped_column(String(64), nullable=False)
    arguments: Mapped[dict[str, object] | None] = mapped_column(JSONB, nullable=True)
    succeeded: Mapped[bool] = mapped_column(nullable=False, default=True)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)

    message: Mapped[ChatMessage] = relationship(back_populates="tool_executions")

    __table_args__ = (
        Index("ix_ai_tool_executions_org", "organization_id"),
        Index("ix_ai_tool_executions_message", "message_id"),
    )


class MessageCitation(Base):
    """A structured source reference behind an assistant answer (MASTER 15.7)."""

    __tablename__ = "message_citations"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    message_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("chat_messages.id"), nullable=False
    )
    source_type: Mapped[str] = mapped_column(String(32), nullable=False)
    source_id: Mapped[str] = mapped_column(String(64), nullable=False)
    label: Mapped[str] = mapped_column(String(200), nullable=False)

    message: Mapped[ChatMessage] = relationship(back_populates="citations")

    __table_args__ = (
        Index("ix_message_citations_org", "organization_id"),
        Index("ix_message_citations_message", "message_id"),
    )
