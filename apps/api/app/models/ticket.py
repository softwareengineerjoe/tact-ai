"""Native ticket aggregate: tickets, comments, and activity (MASTER FR-010).

Native mode owns the ticket record, its status, assignment, comments, and
history. External provider linkage is stored on the ticket for future Jira /
Azure DevOps integration but is unused in native mode.
"""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import TicketPriority, TicketStatus, TicketType
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.employee import Employee


class Ticket(Base):
    __tablename__ = "tickets"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(240), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    ticket_type: Mapped[str] = mapped_column(String(24), nullable=False, default=TicketType.TASK)
    status: Mapped[str] = mapped_column(String(24), nullable=False, default=TicketStatus.BACKLOG)
    priority: Mapped[str] = mapped_column(String(16), nullable=False, default=TicketPriority.MEDIUM)
    assignee_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employees.id")
    )
    reviewer_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employees.id")
    )
    story_points: Mapped[int | None] = mapped_column(Integer)
    due_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    blocker_reason: Mapped[str | None] = mapped_column(Text)
    # External provider linkage (unused in native mode).
    external_provider: Mapped[str | None] = mapped_column(String(24))
    external_id: Mapped[str | None] = mapped_column(String(120))

    assignee: Mapped[Employee | None] = relationship(foreign_keys=[assignee_id])
    reviewer: Mapped[Employee | None] = relationship(foreign_keys=[reviewer_id])
    comments: Mapped[list[TicketComment]] = relationship(
        back_populates="ticket", cascade="all, delete-orphan"
    )
    activity: Mapped[list[TicketActivity]] = relationship(
        back_populates="ticket", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_tickets_org", "organization_id"),
        Index("ix_tickets_project", "project_id"),
        Index("ix_tickets_assignee", "assignee_id"),
    )


class TicketComment(Base):
    __tablename__ = "ticket_comments"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    ticket_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tickets.id"), nullable=False
    )
    author_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)

    ticket: Mapped[Ticket] = relationship(back_populates="comments")

    __table_args__ = (
        Index("ix_ticket_comments_org", "organization_id"),
        Index("ix_ticket_comments_ticket", "ticket_id"),
    )


class TicketActivity(Base):
    """Immutable activity/history entry for a ticket (MASTER FR-010)."""

    __tablename__ = "ticket_activity"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    ticket_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tickets.id"), nullable=False
    )
    actor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    action: Mapped[str] = mapped_column(String(48), nullable=False)
    detail: Mapped[str | None] = mapped_column(Text)

    ticket: Mapped[Ticket] = relationship(back_populates="activity")

    __table_args__ = (
        Index("ix_ticket_activity_org", "organization_id"),
        Index("ix_ticket_activity_ticket", "ticket_id"),
    )
