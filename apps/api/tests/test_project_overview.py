"""Unit tests for the project overview: progress + health (MASTER FR-013, FR-014).

Pure computation is tested directly; the service is exercised with stub
repositories to confirm permission enforcement and aggregation without a DB.
"""

import uuid
from datetime import UTC, datetime, timedelta

import pytest
from app.core.enums import ProjectStatus, TicketPriority, TicketStatus
from app.core.exceptions import NotFound, PermissionDenied
from app.schemas.project_overview import HealthStatus, ProgressMethod
from app.security.permissions import Permission
from app.security.principal import Principal
from app.services.project_overview_service import (
    ProjectOverviewService,
    TicketFact,
    compute_health,
    compute_progress,
)

ORG = uuid.UUID("00000000-0000-0000-0000-0000000000e1")
PROJECT = uuid.UUID("00000000-0000-0000-0000-0000000000e2")
NOW = datetime(2026, 9, 14, tzinfo=UTC)


def _principal(*permissions: Permission) -> Principal:
    return Principal(
        user_id=uuid.uuid4(),
        organization_id=ORG,
        roles=frozenset(),
        permissions=frozenset(permissions),
    )


def _ticket(
    status: TicketStatus,
    *,
    priority: TicketPriority = TicketPriority.MEDIUM,
    story_points: int | None = None,
    due_date: datetime | None = None,
) -> TicketFact:
    return TicketFact(
        status=status,
        priority=priority,
        story_points=story_points,
        due_date=due_date,
    )


# --- compute_progress (FR-013) -------------------------------------------------


def test_progress_uses_story_points_when_consistently_available() -> None:
    tickets = [
        _ticket(TicketStatus.DONE, story_points=3),
        _ticket(TicketStatus.IN_PROGRESS, story_points=1),
    ]
    progress = compute_progress(tickets)
    assert progress.method == ProgressMethod.STORY_POINTS
    assert progress.completed == 3
    assert progress.total == 4
    assert progress.percent == 75


def test_progress_falls_back_to_ticket_ratio() -> None:
    tickets = [
        _ticket(TicketStatus.DONE, story_points=3),
        _ticket(TicketStatus.IN_PROGRESS),  # missing points → ratio method
    ]
    progress = compute_progress(tickets)
    assert progress.method == ProgressMethod.TICKETS
    assert progress.completed == 1
    assert progress.total == 2
    assert progress.percent == 50


def test_progress_excludes_cancelled_tickets() -> None:
    tickets = [
        _ticket(TicketStatus.DONE),
        _ticket(TicketStatus.CANCELLED),
    ]
    progress = compute_progress(tickets)
    assert progress.total == 1
    assert progress.completed == 1
    assert progress.percent == 100


def test_progress_empty_is_zero() -> None:
    progress = compute_progress([])
    assert progress.total == 0
    assert progress.percent == 0


# --- compute_health (FR-014) ---------------------------------------------------


def test_health_red_when_no_manager_on_active_project() -> None:
    health = compute_health(
        project_status=ProjectStatus.ACTIVE,
        has_manager=False,
        tickets=[],
        unfilled_roles=0,
        now=NOW,
    )
    assert health.status == HealthStatus.RED


def test_health_red_when_critical_ticket_overdue() -> None:
    tickets = [
        _ticket(
            TicketStatus.IN_PROGRESS,
            priority=TicketPriority.CRITICAL,
            due_date=NOW - timedelta(days=1),
        )
    ]
    health = compute_health(
        project_status=ProjectStatus.ACTIVE,
        has_manager=True,
        tickets=tickets,
        unfilled_roles=0,
        now=NOW,
    )
    assert health.status == HealthStatus.RED


def test_health_amber_for_blocked_or_unfilled() -> None:
    tickets = [_ticket(TicketStatus.BLOCKED)]
    health = compute_health(
        project_status=ProjectStatus.ACTIVE,
        has_manager=True,
        tickets=tickets,
        unfilled_roles=1,
        now=NOW,
    )
    assert health.status == HealthStatus.AMBER
    assert len(health.reasons) >= 1


def test_health_green_when_no_issues() -> None:
    tickets = [_ticket(TicketStatus.DONE)]
    health = compute_health(
        project_status=ProjectStatus.ACTIVE,
        has_manager=True,
        tickets=tickets,
        unfilled_roles=0,
        now=NOW,
    )
    assert health.status == HealthStatus.GREEN


def test_health_ignores_missing_manager_on_draft() -> None:
    health = compute_health(
        project_status=ProjectStatus.DRAFT,
        has_manager=False,
        tickets=[],
        unfilled_roles=2,
        now=NOW,
    )
    # Draft is not a staffed status, so no manager/staffing rules apply.
    assert health.status == HealthStatus.GREEN


# --- service (permission + aggregation) ---------------------------------------


class _StubProject:
    id = PROJECT
    status = ProjectStatus.ACTIVE
    manager_id = uuid.uuid4()


class _StubRequirement:
    def __init__(self, req_id: uuid.UUID, headcount: int) -> None:
        self.id = req_id
        self.headcount = headcount


class _StubAssignment:
    def __init__(self, role_requirement_id: uuid.UUID, status: str) -> None:
        self.role_requirement_id = role_requirement_id
        self.status = status


class StubProjectRepo:
    def __init__(self, project: object | None) -> None:
        self._project = project
        self._req_id = uuid.uuid4()

    async def get(self, organization_id, project_id):  # type: ignore[no-untyped-def]
        return self._project

    async def list_requirements(self, organization_id, project_id):  # type: ignore[no-untyped-def]
        return [_StubRequirement(self._req_id, headcount=2)]

    @property
    def req_id(self) -> uuid.UUID:
        return self._req_id


class StubTicketRepo:
    async def list_for_project(self, organization_id, project_id):  # type: ignore[no-untyped-def]
        class _T:
            status = TicketStatus.DONE
            priority = TicketPriority.MEDIUM
            story_points = None
            due_date = None

        return [_T()]


class StubAssignmentRepo:
    def __init__(self, req_id: uuid.UUID) -> None:
        self._req_id = req_id

    async def list_for_project(self, organization_id, project_id):  # type: ignore[no-untyped-def]
        return [_StubAssignment(self._req_id, "active")]


@pytest.mark.asyncio
async def test_overview_requires_projects_view() -> None:
    projects = StubProjectRepo(_StubProject())
    service = ProjectOverviewService(
        projects,  # type: ignore[arg-type]
        StubTicketRepo(),  # type: ignore[arg-type]
        StubAssignmentRepo(projects.req_id),  # type: ignore[arg-type]
    )
    with pytest.raises(PermissionDenied):
        await service.get_overview(_principal(), PROJECT)


@pytest.mark.asyncio
async def test_overview_missing_project_raises_not_found() -> None:
    service = ProjectOverviewService(
        StubProjectRepo(None),  # type: ignore[arg-type]
        StubTicketRepo(),  # type: ignore[arg-type]
        StubAssignmentRepo(uuid.uuid4()),  # type: ignore[arg-type]
    )
    with pytest.raises(NotFound):
        await service.get_overview(_principal(Permission.PROJECTS_VIEW), PROJECT)


@pytest.mark.asyncio
async def test_overview_aggregates_staffing_and_progress() -> None:
    projects = StubProjectRepo(_StubProject())
    service = ProjectOverviewService(
        projects,  # type: ignore[arg-type]
        StubTicketRepo(),  # type: ignore[arg-type]
        StubAssignmentRepo(projects.req_id),  # type: ignore[arg-type]
    )
    overview = await service.get_overview(_principal(Permission.PROJECTS_VIEW), PROJECT)

    # One role, headcount 2, one active assignment → one filled, role unfilled.
    assert overview.staffing.required_headcount == 2
    assert overview.staffing.filled_headcount == 1
    assert overview.staffing.unfilled_roles == 1
    # Unfilled role → amber.
    assert overview.health.status == HealthStatus.AMBER
    assert overview.progress.percent == 100
