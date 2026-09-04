"""Org-scoped, soft-delete-aware persistence for project assignments."""

import uuid
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.enums import AssignmentStatus
from app.models.employee import Employee
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
# Statuses that keep an employee "on the team" (a live assignment).
_ACTIVE_STATUSES = (
    AssignmentStatus.RECOMMENDED,
    AssignmentStatus.RESERVED,
    AssignmentStatus.PENDING_APPROVAL,
    AssignmentStatus.CONFIRMED,
    AssignmentStatus.ACTIVE,
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
            .options(selectinload(ProjectAssignment.employee).selectinload(Employee.supervisor))
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
        exclude_assignment_id: uuid.UUID | None = None,
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
        if exclude_assignment_id is not None:
            stmt = stmt.where(ProjectAssignment.id != exclude_assignment_id)
        return list(await self._session.scalars(stmt))

    async def has_project_assignment(
        self,
        organization_id: uuid.UUID,
        project_id: uuid.UUID,
        employee_id: uuid.UUID,
    ) -> bool:
        """Whether the employee worked or is working on the project.

        "Worked or is working" means an assignment that reached at least
        CONFIRMED (confirmed, active, or ended). Recommended/reserved/pending and
        terminal-rejection statuses do not count. Used to constrain feedback to
        real project participants (FR-011).
        """
        qualifying = (
            AssignmentStatus.CONFIRMED,
            AssignmentStatus.ACTIVE,
            AssignmentStatus.ENDED,
        )
        stmt = select(ProjectAssignment.id).where(
            ProjectAssignment.organization_id == organization_id,
            ProjectAssignment.project_id == project_id,
            ProjectAssignment.employee_id == employee_id,
            ProjectAssignment.deleted_at.is_(None),
            ProjectAssignment.status.in_([str(s) for s in qualifying]),
        )
        return (await self._session.scalar(stmt)) is not None

    async def find_active_for_employee_role(
        self,
        organization_id: uuid.UUID,
        project_id: uuid.UUID,
        role_requirement_id: uuid.UUID,
        employee_id: uuid.UUID,
    ) -> ProjectAssignment | None:
        """A live (non-terminal) assignment for this employee on this role, if any.

        Used to prevent duplicate rows when an employee is reserved and then
        confirmed for the same role requirement.
        """
        stmt = select(ProjectAssignment).where(
            ProjectAssignment.organization_id == organization_id,
            ProjectAssignment.project_id == project_id,
            ProjectAssignment.role_requirement_id == role_requirement_id,
            ProjectAssignment.employee_id == employee_id,
            ProjectAssignment.deleted_at.is_(None),
            ProjectAssignment.status.in_([str(s) for s in _ACTIVE_STATUSES]),
        )
        result: ProjectAssignment | None = await self._session.scalar(stmt)
        return result

    async def add(self, assignment: ProjectAssignment) -> ProjectAssignment:
        self._session.add(assignment)
        await self._session.flush()
        return assignment

    async def soft_delete(self, assignment: ProjectAssignment) -> None:
        """Soft-delete a business record, preserving history (MASTER 21)."""
        assignment.deleted_at = datetime.now(UTC)
        assignment.version += 1
        await self._session.flush()

    @staticmethod
    def is_confirmed(status: str) -> bool:
        return status in {str(s) for s in _CONFIRMED_STATUSES}

    @staticmethod
    def is_tentative(status: str) -> bool:
        return status in {str(s) for s in _TENTATIVE_STATUSES}
