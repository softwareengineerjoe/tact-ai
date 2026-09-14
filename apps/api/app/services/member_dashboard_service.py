"""Team-member dashboard aggregation (MASTER FR-016).

Read-only. Aggregates an employee's assignments, capacity, tickets, review
requests, upcoming deadlines, and shared feedback. Every query is org-scoped and
the view is permission-checked (people.view). Shared feedback is only counted
when the caller holds feedback.view_shared; private feedback is never included.
"""

import uuid
from datetime import UTC, datetime, timedelta

from app.core.enums import AssignmentStatus, ProjectStatus, TicketStatus
from app.core.exceptions import NotFound
from app.repositories.assignment_repository import AssignmentRepository
from app.repositories.employee_repository import EmployeeRepository
from app.repositories.feedback_repository import FeedbackRepository
from app.repositories.project_repository import ProjectRepository
from app.repositories.ticket_repository import TicketRepository
from app.schemas.member_dashboard import (
    MemberAllocation,
    MemberDashboardRead,
    MemberDeadline,
    MemberEmployee,
    MemberFeedback,
    MemberProject,
    MemberTicketCounts,
)
from app.security.permissions import Permission
from app.security.principal import Principal
from app.services.capacity_service import CapacityService

# Window over which allocations and upcoming deadlines are assessed.
_WINDOW_DAYS = 90
# A deadline is "upcoming" when due within this horizon.
_DEADLINE_HORIZON_DAYS = 14
# Assignment statuses that put the employee on a project team.
_ON_TEAM_STATUSES = frozenset(
    {
        AssignmentStatus.RESERVED,
        AssignmentStatus.PENDING_APPROVAL,
        AssignmentStatus.CONFIRMED,
        AssignmentStatus.ACTIVE,
    }
)
_CLOSED_TICKET_STATUSES = (TicketStatus.DONE, TicketStatus.CANCELLED)


class MemberDashboardService:
    def __init__(
        self,
        employee_repository: EmployeeRepository,
        assignment_repository: AssignmentRepository,
        ticket_repository: TicketRepository,
        project_repository: ProjectRepository,
        feedback_repository: FeedbackRepository,
        capacity_service: CapacityService,
    ) -> None:
        self._employees = employee_repository
        self._assignments = assignment_repository
        self._tickets = ticket_repository
        self._projects = project_repository
        self._feedback = feedback_repository
        self._capacity = capacity_service

    async def get_overview(
        self, principal: Principal, employee_id: uuid.UUID
    ) -> MemberDashboardRead:
        principal.require(Permission.PEOPLE_VIEW)
        organization_id = principal.organization_id
        now = datetime.now(UTC)
        window_end = now + timedelta(days=_WINDOW_DAYS)

        employee = await self._employees.get(organization_id, employee_id)
        if employee is None:
            raise NotFound("Employee not found")

        capacity = await self._capacity.compute_for_employee(
            organization_id,
            employee,
            period_start=now,
            period_end=window_end,
        )
        allocation = MemberAllocation(
            confirmed_percent=capacity.confirmed_allocation_percent,
            remaining_percent=capacity.remaining_capacity_percent,
            status=capacity.status,
        )

        projects = await self._build_projects(organization_id, employee_id, now, window_end)
        tickets, deadlines = await self._build_tickets(organization_id, employee_id, now)
        feedback = await self._build_feedback(principal, organization_id, employee_id)

        return MemberDashboardRead(
            employee=MemberEmployee(
                id=str(employee.id),
                display_name=employee.display_name,
                job_title=employee.job_title,
            ),
            allocation=allocation,
            projects=projects,
            tickets=tickets,
            upcoming_deadlines=deadlines,
            feedback=feedback,
            generated_at=now,
        )

    async def _build_projects(
        self,
        organization_id: uuid.UUID,
        employee_id: uuid.UUID,
        now: datetime,
        window_end: datetime,
    ) -> list[MemberProject]:
        assignments = await self._assignments.list_active_for_employee(
            organization_id,
            employee_id,
            period_start=now,
            period_end=window_end,
        )
        projects: list[MemberProject] = []
        seen: set[uuid.UUID] = set()
        for assignment in assignments:
            if assignment.status not in _ON_TEAM_STATUSES:
                continue
            if assignment.project_id in seen:
                continue
            seen.add(assignment.project_id)
            project = await self._projects.get(organization_id, assignment.project_id)
            if project is None:
                continue
            projects.append(
                MemberProject(
                    project_id=str(project.id),
                    name=project.name,
                    status=ProjectStatus(project.status),
                    allocation_percent=assignment.allocation_percent,
                )
            )
        return projects

    async def _build_tickets(
        self,
        organization_id: uuid.UUID,
        employee_id: uuid.UUID,
        now: datetime,
    ) -> tuple[MemberTicketCounts, list[MemberDeadline]]:
        tickets = await self._tickets.list_for_employee(organization_id, employee_id)
        assigned_open = [
            t
            for t in tickets
            if t.assignee_id == employee_id and t.status not in _CLOSED_TICKET_STATUSES
        ]
        blocked = sum(1 for t in assigned_open if t.status == TicketStatus.BLOCKED)
        overdue = sum(1 for t in assigned_open if t.due_date is not None and t.due_date < now)
        review_requests = sum(
            1
            for t in tickets
            if t.reviewer_id == employee_id and t.status == TicketStatus.IN_REVIEW
        )

        horizon = now + timedelta(days=_DEADLINE_HORIZON_DAYS)
        deadlines = [
            MemberDeadline(
                ticket_id=str(t.id),
                title=t.title,
                due_date=t.due_date,
                project_id=str(t.project_id),
            )
            for t in assigned_open
            if t.due_date is not None and now <= t.due_date <= horizon
        ]
        deadlines.sort(key=lambda d: d.due_date)

        counts = MemberTicketCounts(
            open=len(assigned_open),
            blocked=blocked,
            overdue=overdue,
            review_requests=review_requests,
        )
        return counts, deadlines

    async def _build_feedback(
        self,
        principal: Principal,
        organization_id: uuid.UUID,
        employee_id: uuid.UUID,
    ) -> MemberFeedback:
        # Only count shared feedback, and only when the caller may view it.
        if not principal.has(Permission.FEEDBACK_VIEW_SHARED):
            return MemberFeedback(shared_count=0)
        shared = await self._feedback.list_for_employee(
            organization_id, employee_id, include_private=False
        )
        return MemberFeedback(shared_count=len(shared))
