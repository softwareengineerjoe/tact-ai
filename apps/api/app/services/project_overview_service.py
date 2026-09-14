"""Project overview aggregation: progress + health (MASTER FR-013, FR-014).

Read-only. Progress is deterministic (story points when consistently available,
otherwise ticket ratio). Health is rule-based — the AI may explain it but never
invents it (MASTER FR-014). Every query is org-scoped and permission-checked.
"""

import uuid
from dataclasses import dataclass
from datetime import UTC, datetime

from app.core.enums import ProjectStatus, TicketPriority, TicketStatus
from app.core.exceptions import NotFound
from app.repositories.assignment_repository import AssignmentRepository
from app.repositories.project_repository import ProjectRepository
from app.repositories.ticket_repository import TicketRepository
from app.schemas.project_overview import (
    HealthStatus,
    ProgressMethod,
    ProjectHealth,
    ProjectOverviewRead,
    ProjectProgress,
    ProjectStaffing,
    ProjectTicketCounts,
)
from app.security.permissions import Permission
from app.security.principal import Principal

# Assignment statuses that count as "filling" a role for staffing purposes.
_FILLED_ASSIGNMENT_STATUSES = ("confirmed", "active")
# Project statuses where staffing gaps and a missing manager matter.
_STAFFED_STATUSES = frozenset(
    {
        ProjectStatus.STAFFING,
        ProjectStatus.READY_FOR_APPROVAL,
        ProjectStatus.ACTIVE,
        ProjectStatus.ON_HOLD,
        ProjectStatus.CLOSING,
    }
)


@dataclass(frozen=True, slots=True)
class TicketFact:
    """The minimal ticket data needed to compute progress and health."""

    status: str
    priority: str
    story_points: int | None
    due_date: datetime | None


def compute_progress(tickets: list[TicketFact]) -> ProjectProgress:
    """Progress ratio (MASTER FR-013). Cancelled tickets never count.

    Uses story points when every counted ticket has them; otherwise falls back
    to the completed/total ticket ratio.
    """
    counted = [t for t in tickets if t.status != TicketStatus.CANCELLED]
    if not counted:
        return ProjectProgress(method=ProgressMethod.TICKETS, completed=0, total=0, percent=0)

    use_points = all(t.story_points is not None for t in counted)
    if use_points:
        total = sum(t.story_points or 0 for t in counted)
        completed = sum(t.story_points or 0 for t in counted if t.status == TicketStatus.DONE)
        method = ProgressMethod.STORY_POINTS
    else:
        total = len(counted)
        completed = sum(1 for t in counted if t.status == TicketStatus.DONE)
        method = ProgressMethod.TICKETS

    percent = round(completed / total * 100) if total > 0 else 0
    return ProjectProgress(method=method, completed=completed, total=total, percent=percent)


def compute_ticket_counts(tickets: list[TicketFact], *, now: datetime) -> ProjectTicketCounts:
    closed = (TicketStatus.DONE, TicketStatus.CANCELLED)
    open_count = sum(1 for t in tickets if t.status not in closed)
    blocked = sum(1 for t in tickets if t.status == TicketStatus.BLOCKED)
    done = sum(1 for t in tickets if t.status == TicketStatus.DONE)
    overdue = sum(
        1 for t in tickets if t.status not in closed and t.due_date is not None and t.due_date < now
    )
    return ProjectTicketCounts(
        total=len(tickets),
        open=open_count,
        blocked=blocked,
        overdue=overdue,
        done=done,
    )


def compute_health(
    *,
    project_status: ProjectStatus,
    has_manager: bool,
    tickets: list[TicketFact],
    unfilled_roles: int,
    now: datetime,
) -> ProjectHealth:
    """Rule-based health (MASTER FR-014). Most severe matched rule wins."""
    staffed = project_status in _STAFFED_STATUSES
    closed = (TicketStatus.DONE, TicketStatus.CANCELLED)

    critical_overdue = any(
        t.priority == TicketPriority.CRITICAL
        and t.status not in closed
        and t.due_date is not None
        and t.due_date < now
        for t in tickets
    )
    any_overdue = any(
        t.status not in closed and t.due_date is not None and t.due_date < now for t in tickets
    )
    any_blocked = any(t.status == TicketStatus.BLOCKED for t in tickets)

    red_reasons: list[str] = []
    if staffed and not has_manager:
        red_reasons.append("The project has no active manager.")
    if critical_overdue:
        red_reasons.append("A critical ticket is overdue.")
    if red_reasons:
        return ProjectHealth(status=HealthStatus.RED, reasons=red_reasons)

    amber_reasons: list[str] = []
    if staffed and unfilled_roles > 0:
        amber_reasons.append(
            f"{unfilled_roles} role{'s' if unfilled_roles != 1 else ''} still unfilled."
        )
    if any_overdue:
        amber_reasons.append("One or more tickets are overdue.")
    if any_blocked:
        amber_reasons.append("One or more tickets are blocked.")
    if amber_reasons:
        return ProjectHealth(status=HealthStatus.AMBER, reasons=amber_reasons)

    return ProjectHealth(status=HealthStatus.GREEN, reasons=["No issues detected."])


class ProjectOverviewService:
    def __init__(
        self,
        project_repository: ProjectRepository,
        ticket_repository: TicketRepository,
        assignment_repository: AssignmentRepository,
    ) -> None:
        self._projects = project_repository
        self._tickets = ticket_repository
        self._assignments = assignment_repository

    async def get_overview(
        self, principal: Principal, project_id: uuid.UUID
    ) -> ProjectOverviewRead:
        principal.require(Permission.PROJECTS_VIEW)
        organization_id = principal.organization_id
        now = datetime.now(UTC)

        project = await self._projects.get(organization_id, project_id)
        if project is None:
            raise NotFound("Project not found")

        ticket_models = await self._tickets.list_for_project(organization_id, project_id)
        tickets = [
            TicketFact(
                status=t.status,
                priority=t.priority,
                story_points=t.story_points,
                due_date=t.due_date,
            )
            for t in ticket_models
        ]

        requirements = await self._projects.list_requirements(organization_id, project_id)
        assignments = await self._assignments.list_for_project(organization_id, project_id)
        filled_by_role: dict[uuid.UUID, int] = {}
        for assignment in assignments:
            if assignment.status in _FILLED_ASSIGNMENT_STATUSES:
                filled_by_role[assignment.role_requirement_id] = (
                    filled_by_role.get(assignment.role_requirement_id, 0) + 1
                )

        required_headcount = sum(r.headcount for r in requirements)
        filled_headcount = 0
        unfilled_roles = 0
        for requirement in requirements:
            filled = min(filled_by_role.get(requirement.id, 0), requirement.headcount)
            filled_headcount += filled
            if filled < requirement.headcount:
                unfilled_roles += 1

        project_status = ProjectStatus(project.status)
        return ProjectOverviewRead(
            project_id=str(project.id),
            status=project_status,
            progress=compute_progress(tickets),
            health=compute_health(
                project_status=project_status,
                has_manager=project.manager_id is not None,
                tickets=tickets,
                unfilled_roles=unfilled_roles,
                now=now,
            ),
            staffing=ProjectStaffing(
                required_headcount=required_headcount,
                filled_headcount=filled_headcount,
                unfilled_roles=unfilled_roles,
            ),
            tickets=compute_ticket_counts(tickets, now=now),
            generated_at=now,
        )
