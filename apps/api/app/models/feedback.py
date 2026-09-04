"""Feedback aggregate: feedback, revisions, acknowledgements, access log (FR-011).

Feedback stays inside TACT AI. Private feedback (MANAGER_ONLY visibility) is
excluded from general search and its reads are audited. Feedback never changes
an employee's recommendation score.
"""

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import FeedbackCategory, FeedbackStatus, FeedbackVisibility
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.employee import Employee


class Feedback(Base):
    __tablename__ = "feedback"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False
    )
    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False
    )
    author_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    category: Mapped[str] = mapped_column(
        String(32), nullable=False, default=FeedbackCategory.RECOGNITION
    )
    visibility: Mapped[str] = mapped_column(
        String(32), nullable=False, default=FeedbackVisibility.MANAGER_ONLY
    )
    body: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(24), nullable=False, default=FeedbackStatus.DRAFT)

    employee: Mapped[Employee] = relationship()
    revisions: Mapped[list[FeedbackRevision]] = relationship(
        back_populates="feedback", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_feedback_org", "organization_id"),
        Index("ix_feedback_project", "project_id"),
        Index("ix_feedback_employee", "employee_id"),
    )


class FeedbackRevision(Base):
    """Immutable snapshot of feedback content at submit/edit time (FR-011)."""

    __tablename__ = "feedback_revisions"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    feedback_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("feedback.id"), nullable=False
    )
    editor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)

    feedback: Mapped[Feedback] = relationship(back_populates="revisions")

    __table_args__ = (
        Index("ix_feedback_revisions_org", "organization_id"),
        Index("ix_feedback_revisions_feedback", "feedback_id"),
    )


class FeedbackAcknowledgement(Base):
    __tablename__ = "feedback_acknowledgements"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    feedback_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("feedback.id"), nullable=False
    )
    acknowledged_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)

    __table_args__ = (
        Index("ix_feedback_ack_org", "organization_id"),
        Index("ix_feedback_ack_feedback", "feedback_id"),
    )


class FeedbackAccessLog(Base):
    """Audit record for access to private feedback (MASTER 28, FR-011)."""

    __tablename__ = "feedback_access_log"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    feedback_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("feedback.id"), nullable=False
    )
    accessed_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)

    __table_args__ = (
        Index("ix_feedback_access_org", "organization_id"),
        Index("ix_feedback_access_feedback", "feedback_id"),
    )
