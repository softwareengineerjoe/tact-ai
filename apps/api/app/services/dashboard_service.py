"""Manager dashboard aggregation (MASTER FR-015).

Read-only management overview. Aggregates existing project, ticket, and
capacity data into deterministic counts. Every query is org-scoped and the
whole view is permission-checked (reports.view).
"""

from datetime import UTC, datetime, timedelta

from app.core.enums import AvailabilityStatus, ProjectStatus
from app.repositories.project_repository import ProjectRepository
from app.repositories.ticket_repository import TicketRepository
from app.schemas.common import PageParams
from app.schemas.dashboard import (
    DashboardPeople,
    DashboardProjects,
    DashboardRead,
    DashboardTickets,
)
from app.security.permissions import Permission
from app.security.principal import Principal
from app.services.capacity_service import CapacityService

# Window over which "available" / "overallocated" is assessed.
_CAPACITY_WINDOW_DAYS = 90
# People sample size for the overview (demo orgs are small; MASTER 29 scale).
_PEOPLE_SAMPLE = 100

_AVAILABLE_STATUSES = frozenset(
    {AvailabilityStatus.AVAILABLE, AvailabilityStatus.PARTIALLY_AVAILABLE}
)


class DashboardService:
    def __init__(
        self,
        project_repository: ProjectRepository,
        ticket_repository: TicketRepository,
        capacity_service: CapacityService,
    ) -> None:
        self._projects = project_repository
        self._tickets = ticket_repository
        self._capacity = capacity_service

    async def get_overview(self, principal: Principal) -> DashboardRead:
        principal.require(Permission.REPORTS_VIEW)
        organization_id = principal.organization_id
        now = datetime.now(UTC)

        status_counts = await self._projects.count_by_status(organization_id)
        projects = DashboardProjects(
            active=status_counts.get(ProjectStatus.ACTIVE, 0),
            awaiting_staffing=(
                status_counts.get(ProjectStatus.STAFFING, 0)
                + status_counts.get(ProjectStatus.READY_FOR_APPROVAL, 0)
            ),
            total=sum(status_counts.values()),
        )

        ticket_counts = await self._tickets.dashboard_counts(organization_id, now=now)
        tickets = DashboardTickets(
            open=ticket_counts["open"],
            blocked=ticket_counts["blocked"],
            overdue=ticket_counts["overdue"],
            in_review=ticket_counts["in_review"],
        )

        capacities = await self._capacity.compute_for_all(
            organization_id,
            period_start=now,
            period_end=now + timedelta(days=_CAPACITY_WINDOW_DAYS),
            params=PageParams(page=1, page_size=_PEOPLE_SAMPLE),
        )
        available = sum(1 for c in capacities if c.status in _AVAILABLE_STATUSES)
        fully_allocated = sum(
            1 for c in capacities if c.status == AvailabilityStatus.FULLY_ALLOCATED
        )
        overallocated = sum(1 for c in capacities if c.status == AvailabilityStatus.OVERALLOCATED)
        people = DashboardPeople(
            available=available,
            fully_allocated=fully_allocated,
            overallocated=overallocated,
            total=len(capacities),
        )

        return DashboardRead(
            projects=projects,
            tickets=tickets,
            people=people,
            generated_at=now,
        )
