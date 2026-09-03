"""Assignment lifecycle: reservations, approvals, and confirmations.

Implements the assignment lifecycle and its rules (MASTER FR-008): temporary
reservations expire, confirmed assignments have dates and update capacity, and
overallocation requires an explicit permission plus an override reason. The
manager always makes the final decision.
"""

import uuid
from dataclasses import dataclass
from datetime import datetime

from app.core.enums import AssignmentStatus
from app.core.exceptions import ConflictError, NotFound, ValidationError
from app.models.employee import Employee
from app.models.project import ProjectAssignment, ProjectRoleRequirement
from app.repositories.assignment_repository import AssignmentRepository
from app.repositories.employee_repository import EmployeeRepository
from app.repositories.project_repository import ProjectRepository
from app.schemas.team import AssignmentCreate, AssignmentUpdate, ReservationCreate
from app.security.permissions import Permission
from app.security.principal import Principal
from app.services.capacity_service import CapacityService

# Allowed status transitions (MASTER FR-008).
_ALLOWED_TRANSITIONS: dict[AssignmentStatus, frozenset[AssignmentStatus]] = {
    AssignmentStatus.RECOMMENDED: frozenset({AssignmentStatus.RESERVED, AssignmentStatus.REJECTED}),
    AssignmentStatus.RESERVED: frozenset(
        {AssignmentStatus.PENDING_APPROVAL, AssignmentStatus.EXPIRED}
    ),
    AssignmentStatus.PENDING_APPROVAL: frozenset(
        {AssignmentStatus.CONFIRMED, AssignmentStatus.DECLINED}
    ),
    AssignmentStatus.CONFIRMED: frozenset({AssignmentStatus.ACTIVE, AssignmentStatus.CANCELLED}),
    AssignmentStatus.ACTIVE: frozenset({AssignmentStatus.ENDED}),
}


@dataclass(frozen=True, slots=True)
class AssignmentResult:
    assignment: ProjectAssignment
    warnings: list[str]


class AssignmentService:
    def __init__(
        self,
        project_repository: ProjectRepository,
        employee_repository: EmployeeRepository,
        assignment_repository: AssignmentRepository,
        capacity_service: CapacityService,
    ) -> None:
        self._projects = project_repository
        self._employees = employee_repository
        self._assignments = assignment_repository
        self._capacity = capacity_service

    async def list_team(
        self, principal: Principal, project_id: uuid.UUID
    ) -> list[ProjectAssignment]:
        principal.require(Permission.PROJECTS_VIEW)
        await self._require_project(principal, project_id)
        return await self._assignments.list_for_project(principal.organization_id, project_id)

    async def reserve(
        self,
        principal: Principal,
        project_id: uuid.UUID,
        data: ReservationCreate,
    ) -> ProjectAssignment:
        principal.require(Permission.TEAM_ASSIGN)
        await self._require_project(principal, project_id)
        requirement = await self._require_requirement(
            principal, project_id, data.role_requirement_id
        )
        await self._require_employee(principal, data.employee_id)

        if data.expires_at <= datetime.now(data.expires_at.tzinfo):
            raise ValidationError("Reservation expiry must be in the future")

        assignment = ProjectAssignment(
            organization_id=principal.organization_id,
            project_id=project_id,
            role_requirement_id=requirement.id,
            employee_id=data.employee_id,
            status=AssignmentStatus.RESERVED,
            allocation_percent=data.allocation_percent,
            expires_at=data.expires_at,
        )
        return await self._assignments.add(assignment)

    async def create_assignment(
        self,
        principal: Principal,
        project_id: uuid.UUID,
        data: AssignmentCreate,
    ) -> AssignmentResult:
        principal.require(Permission.TEAM_ASSIGN)
        await self._require_project(principal, project_id)
        requirement = await self._require_requirement(
            principal, project_id, data.role_requirement_id
        )
        employee = await self._require_employee(principal, data.employee_id)

        if data.end_date <= data.start_date:
            raise ValidationError("Assignment end date must be after the start date")

        capacity = await self._capacity.compute_for_employee(
            principal.organization_id,
            employee,
            period_start=data.start_date,
            period_end=data.end_date,
        )
        warnings: list[str] = []
        would_remain = capacity.remaining_capacity_percent - data.allocation_percent
        if would_remain < 0:
            # Overallocation requires an explicit permission and an override reason.
            if not data.override_reason:
                raise ValidationError(
                    "Confirming this employee would exceed their capacity; "
                    "an override reason is required"
                )
            principal.require(Permission.TEAM_OVERRIDE_CAPACITY)
            warnings.append(f"Overallocation approved: remaining capacity would be {would_remain}%")

        assignment = ProjectAssignment(
            organization_id=principal.organization_id,
            project_id=project_id,
            role_requirement_id=requirement.id,
            employee_id=data.employee_id,
            status=AssignmentStatus.CONFIRMED,
            allocation_percent=data.allocation_percent,
            start_date=data.start_date,
            end_date=data.end_date,
            override_reason=data.override_reason,
        )
        created = await self._assignments.add(assignment)
        return AssignmentResult(assignment=created, warnings=warnings)

    async def update_status(
        self,
        principal: Principal,
        assignment_id: uuid.UUID,
        data: AssignmentUpdate,
    ) -> ProjectAssignment:
        assignment = await self._assignments.get(principal.organization_id, assignment_id)
        if assignment is None:
            raise NotFound("Assignment not found")
        if assignment.version != data.version:
            raise ConflictError("Assignment was modified by someone else")

        current = AssignmentStatus(assignment.status)
        target = data.status
        # Removal from a project requires the remove permission.
        if target in {AssignmentStatus.CANCELLED, AssignmentStatus.ENDED}:
            principal.require(Permission.TEAM_REMOVE)
        else:
            principal.require(Permission.TEAM_ASSIGN)

        allowed = _ALLOWED_TRANSITIONS.get(current, frozenset())
        if target != current and target not in allowed:
            raise ValidationError(f"Cannot transition assignment from {current} to {target}")

        assignment.status = target
        if data.override_reason is not None:
            assignment.override_reason = data.override_reason
        assignment.version += 1
        return assignment

    async def _require_project(self, principal: Principal, project_id: uuid.UUID) -> None:
        project = await self._projects.get(principal.organization_id, project_id)
        if project is None:
            raise NotFound("Project not found")

    async def _require_requirement(
        self,
        principal: Principal,
        project_id: uuid.UUID,
        requirement_id: uuid.UUID,
    ) -> ProjectRoleRequirement:
        requirement = await self._projects.get_requirement(
            principal.organization_id, requirement_id
        )
        if requirement is None or requirement.project_id != project_id:
            raise NotFound("Project role requirement not found")
        return requirement

    async def _require_employee(self, principal: Principal, employee_id: uuid.UUID) -> Employee:
        employee = await self._employees.get(principal.organization_id, employee_id)
        if employee is None:
            raise NotFound("Employee not found")
        return employee
