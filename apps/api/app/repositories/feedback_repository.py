"""Org-scoped, soft-delete-aware persistence for feedback (MASTER 21, FR-011)."""

import uuid
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.enums import FeedbackVisibility
from app.models.feedback import (
    Feedback,
    FeedbackAccessLog,
    FeedbackAcknowledgement,
    FeedbackRevision,
)


class FeedbackRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get(self, organization_id: uuid.UUID, feedback_id: uuid.UUID) -> Feedback | None:
        stmt = (
            select(Feedback)
            .where(
                Feedback.id == feedback_id,
                Feedback.organization_id == organization_id,
                Feedback.deleted_at.is_(None),
            )
            .options(selectinload(Feedback.employee))
        )
        result: Feedback | None = await self._session.scalar(stmt)
        return result

    async def list_for_project(
        self,
        organization_id: uuid.UUID,
        project_id: uuid.UUID,
        *,
        include_private: bool,
    ) -> list[Feedback]:
        """List a project's feedback. Private (MANAGER_ONLY) feedback is only
        returned when the caller is authorized (MASTER FR-011)."""
        stmt = (
            select(Feedback)
            .where(
                Feedback.organization_id == organization_id,
                Feedback.project_id == project_id,
                Feedback.deleted_at.is_(None),
            )
            .options(selectinload(Feedback.employee))
            .order_by(Feedback.created_at.desc())
        )
        if not include_private:
            stmt = stmt.where(Feedback.visibility != FeedbackVisibility.MANAGER_ONLY)
        return list(await self._session.scalars(stmt))

    async def list_for_employee(
        self,
        organization_id: uuid.UUID,
        employee_id: uuid.UUID,
        *,
        include_private: bool,
    ) -> list[Feedback]:
        """List the feedback an employee has received across projects. Private
        (MANAGER_ONLY) feedback is only returned when authorized (MASTER FR-011)."""
        stmt = (
            select(Feedback)
            .where(
                Feedback.organization_id == organization_id,
                Feedback.employee_id == employee_id,
                Feedback.deleted_at.is_(None),
            )
            .options(selectinload(Feedback.employee))
            .order_by(Feedback.created_at.desc())
        )
        if not include_private:
            stmt = stmt.where(Feedback.visibility != FeedbackVisibility.MANAGER_ONLY)
        return list(await self._session.scalars(stmt))

    async def add(self, feedback: Feedback) -> Feedback:
        self._session.add(feedback)
        await self._session.flush()
        return feedback

    async def add_revision(self, revision: FeedbackRevision) -> FeedbackRevision:
        self._session.add(revision)
        await self._session.flush()
        return revision

    async def add_acknowledgement(self, ack: FeedbackAcknowledgement) -> FeedbackAcknowledgement:
        self._session.add(ack)
        await self._session.flush()
        return ack

    async def record_access(self, log: FeedbackAccessLog) -> None:
        self._session.add(log)
        await self._session.flush()

    async def soft_delete(self, feedback: Feedback) -> None:
        feedback.deleted_at = datetime.now(UTC)
        feedback.version += 1
        await self._session.flush()
