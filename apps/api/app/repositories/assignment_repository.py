"""Org-scoped, soft-delete-aware persistence for project assignments."""

import uuid
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import AssignmentStatus
from app.models.project import ProjectAssignment

# Statuses that consume capacity when they overlap a period.
_CONFIRMED_STATUSES = (
    AssignmentStatus.CONFIRMED,
    AssignmentStatus.ACTIVE,
)
_TENTATIVE_STATUSES = (
    AssignmentStatus.RESERVED,
    AssignmentStatus.PENDING_APPROVAL,
)


class AssignmentRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get(
        self, organization_id: uuid.UUID, assignment_id: uuid.UUID
    ) -> ProjectAssignment | None:
        stmt = select(ProjectAssignment).where(
            ProjectAssignment.id == assignment_id,
            ProjectAssignment.organization_id == organization_id,
            ProjectAssignment.deleted_at.is_(None),
        )
        result: ProjectAssignment | None = await self._session.scalar(stmt)
        return result

    async def list_for_project(
        self, organization_id: uuid.UUID, project_id: uuid.UUID
    ) -> list[ProjectAssignment]:
        stmt = (
            select(ProjectAssignment)
            .where(
                ProjectAssignment.organization_id == organization_id,
                ProjectAssignment.project_id == project_id,
                ProjectAssignment.deleted_at.is_(None),
            )
            .order_by(ProjectAssignment.created_at.asc())
        )
        return list(await self._session.scalars(stmt))

    async def list_active_for_employee(
        self,
        organization_id: uuid.UUID,
        employee_id: uuid.UUID,
        *,
        period_start: datetime,
        period_end: datetime,
    ) -> list[ProjectAssignment]:
        """Assignments that consume capacity and overlap the given period."""
        active = (*_CONFIRMED_STATUSES, *_TENTATIVE_STATUSES)
        stmt = select(ProjectAssignment).where(
            ProjectAssignment.organization_id == organization_id,
            ProjectAssignment.employee_id == employee_id,
            ProjectAssignment.deleted_at.is_(None),
            ProjectAssignment.status.in_([str(s) for s in active]),
            # Overlap: existing.start <= period_end AND existing.end >= period_start.
            ProjectAssignment.start_date <= period_end,
            ProjectAssignment.end_date >= period_start,
        )
        return list(await self._session.scalars(stmt))

    async def add(self, assignment: ProjectAssignment) -> ProjectAssignment:
        self._session.add(assignment)
        await self._session.flush()
        return assignment

    @staticmethod
    def is_confirmed(status: str) -> bool:
        return status in {str(s) for s in _CONFIRMED_STATUSES}

    @staticmethod
    def is_tentative(status: str) -> bool:
        return status in {str(s) for s in _TENTATIVE_STATUSES}
