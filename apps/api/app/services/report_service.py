"""Weekly project status report (MASTER FR-017).

Reports are composed deterministically from existing project, ticket, and
assignment data — reusing the same computation as the project overview
(progress, health, staffing, ticket counts). The AI may narrate a report but
never computes or invents its figures. Every query is org-scoped and
permission-checked.
"""

import uuid
from datetime import UTC, datetime

from app.core.enums import ProjectStatus, TicketStatus
from app.core.exceptions import NotFound
from app.repositories.assignment_repository import AssignmentRepository
from app.repositories.project_repository import ProjectRepository
from app.repositories.ticket_repository import TicketRepository
from app.schemas.project_overview import (
    ProjectHealth,
    ProjectProgress,
    ProjectStaffing,
    ProjectTicketCounts,
)
from app.schemas.report import ReportTicketRef, WeeklyStatusReportRead
from app.security.permissions import Permission
from app.security.principal import Principal
from app.services.project_overview_service import (
    TicketFact,
    compute_health,
    compute_progress,
    compute_ticket_counts,
)

# Assignment statuses that count as "filling" a role (mirrors overview service).
_FILLED_ASSIGNMENT_STATUSES = ("confirmed", "active")
_CLOSED_TICKET_STATUSES = (TicketStatus.DONE, TicketStatus.CANCELLED)
_MAX_LISTED_TICKETS = 10


class ReportService:
    def __init__(
        self,
        project_repository: ProjectRepository,
        ticket_repository: TicketRepository,
        assignment_repository: AssignmentRepository,
    ) -> None:
        self._projects = project_repository
        self._tickets = ticket_repository
        self._assignments = assignment_repository

    async def generate_weekly_status(
        self, principal: Principal, project_id: uuid.UUID
    ) -> WeeklyStatusReportRead:
        principal.require(Permission.REPORTS_VIEW)
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
        progress = compute_progress(tickets)
        counts = compute_ticket_counts(tickets, now=now)
        health = compute_health(
            project_status=project_status,
            has_manager=project.manager_id is not None,
            tickets=tickets,
            unfilled_roles=unfilled_roles,
            now=now,
        )
        staffing = ProjectStaffing(
            required_headcount=required_headcount,
            filled_headcount=filled_headcount,
            unfilled_roles=unfilled_roles,
        )

        blocked = [
            ReportTicketRef(ticket_id=str(t.id), title=t.title)
            for t in ticket_models
            if t.status == TicketStatus.BLOCKED
        ][:_MAX_LISTED_TICKETS]
        overdue = [
            ReportTicketRef(ticket_id=str(t.id), title=t.title)
            for t in ticket_models
            if t.status not in _CLOSED_TICKET_STATUSES
            and t.due_date is not None
            and t.due_date < now
        ][:_MAX_LISTED_TICKETS]
        highlights_tickets = [
            f"Completed: {t.title}" for t in ticket_models if t.status == TicketStatus.DONE
        ][:_MAX_LISTED_TICKETS]

        risks = self._build_risks(health, staffing, blocked, overdue)
        highlights = self._build_highlights(progress, highlights_tickets)
        summary = self._build_summary(project.name, progress, health, staffing, counts)

        return WeeklyStatusReportRead(
            project_id=str(project.id),
            project_name=project.name,
            status=project_status,
            summary=summary,
            progress=progress,
            health=health,
            staffing=staffing,
            tickets=counts,
            highlights=highlights,
            risks=risks,
            blocked_tickets=blocked,
            overdue_tickets=overdue,
            generated_at=now,
        )

    @staticmethod
    def _build_risks(
        health: ProjectHealth,
        staffing: ProjectStaffing,
        blocked: list[ReportTicketRef],
        overdue: list[ReportTicketRef],
    ) -> list[str]:
        risks: list[str] = []
        if staffing.unfilled_roles > 0:
            risks.append(
                f"{staffing.unfilled_roles} role"
                f"{'s' if staffing.unfilled_roles != 1 else ''} still unfilled."
            )
        if blocked:
            risks.append(f"{len(blocked)} blocked ticket{'s' if len(blocked) != 1 else ''}.")
        if overdue:
            risks.append(f"{len(overdue)} overdue ticket{'s' if len(overdue) != 1 else ''}.")
        return risks

    @staticmethod
    def _build_highlights(progress: ProjectProgress, completed_tickets: list[str]) -> list[str]:
        highlights: list[str] = []
        if progress.percent > 0:
            highlights.append(f"Progress at {progress.percent}%.")
        highlights.extend(completed_tickets)
        return highlights

    @staticmethod
    def _build_summary(
        project_name: str,
        progress: ProjectProgress,
        health: ProjectHealth,
        staffing: ProjectStaffing,
        counts: ProjectTicketCounts,
    ) -> str:
        return (
            f"{project_name} is {health.status.value} at {progress.percent}% progress "
            f"with {counts.open} open ticket{'s' if counts.open != 1 else ''} and "
            f"{staffing.filled_headcount}/{staffing.required_headcount} roles filled."
        )
