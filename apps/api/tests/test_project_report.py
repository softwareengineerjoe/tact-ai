"""Unit tests for the weekly status report (MASTER FR-017).

The report is composed deterministically from project/ticket/assignment data.
Stub repositories exercise permission enforcement and deterministic composition
(named blocked/overdue risks, completed highlights) without a database.
"""

import uuid
from datetime import UTC, datetime, timedelta

import pytest
from app.core.enums import ProjectStatus, TicketPriority, TicketStatus
from app.core.exceptions import NotFound, PermissionDenied
from app.schemas.project_overview import HealthStatus
from app.security.permissions import Permission
from app.security.principal import Principal
from app.services.report_service import ReportService

ORG = uuid.UUID("00000000-0000-0000-0000-0000000000f1")
PROJECT = uuid.UUID("00000000-0000-0000-0000-0000000000f2")
NOW = datetime(2026, 9, 14, tzinfo=UTC)


def _principal(*permissions: Permission) -> Principal:
    return Principal(
        user_id=uuid.uuid4(),
        organization_id=ORG,
        roles=frozenset(),
        permissions=frozenset(permissions),
    )


class _StubTicket:
    def __init__(
        self,
        title: str,
        status: TicketStatus,
        *,
        priority: TicketPriority = TicketPriority.MEDIUM,
        story_points: int | None = None,
        due_date: datetime | None = None,
    ) -> None:
        self.id = uuid.uuid4()
        self.title = title
        self.status = status
        self.priority = priority
        self.story_points = story_points
        self.due_date = due_date


class _StubProject:
    id = PROJECT
    name = "Atlas"
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
    def __init__(self, tickets: list[_StubTicket]) -> None:
        self._tickets = tickets

    async def list_for_project(self, organization_id, project_id):  # type: ignore[no-untyped-def]
        return self._tickets


class StubAssignmentRepo:
    def __init__(self, req_id: uuid.UUID) -> None:
        self._req_id = req_id

    async def list_for_project(self, organization_id, project_id):  # type: ignore[no-untyped-def]
        return [_StubAssignment(self._req_id, "active")]


def _service(project: object | None, tickets: list[_StubTicket]) -> ReportService:
    projects = StubProjectRepo(project)
    return ReportService(
        projects,  # type: ignore[arg-type]
        StubTicketRepo(tickets),  # type: ignore[arg-type]
        StubAssignmentRepo(projects.req_id),  # type: ignore[arg-type]
    )


@pytest.mark.asyncio
async def test_report_requires_reports_view() -> None:
    service = _service(_StubProject(), [])
    with pytest.raises(PermissionDenied):
        await service.generate_weekly_status(_principal(), PROJECT)


@pytest.mark.asyncio
async def test_report_missing_project_raises_not_found() -> None:
    service = _service(None, [])
    with pytest.raises(NotFound):
        await service.generate_weekly_status(_principal(Permission.REPORTS_VIEW), PROJECT)


@pytest.mark.asyncio
async def test_report_names_blocked_and_overdue_risks() -> None:
    tickets = [
        _StubTicket("Fix login", TicketStatus.BLOCKED),
        _StubTicket(
            "Ship API",
            TicketStatus.IN_PROGRESS,
            due_date=NOW - timedelta(days=400),
        ),
        _StubTicket("Write docs", TicketStatus.DONE),
    ]
    service = _service(_StubProject(), tickets)
    report = await service.generate_weekly_status(_principal(Permission.REPORTS_VIEW), PROJECT)

    assert [t.title for t in report.blocked_tickets] == ["Fix login"]
    assert [t.title for t in report.overdue_tickets] == ["Ship API"]
    assert any("blocked" in risk.lower() for risk in report.risks)
    assert any("overdue" in risk.lower() for risk in report.risks)


@pytest.mark.asyncio
async def test_report_highlights_completed_tickets() -> None:
    tickets = [_StubTicket("Write docs", TicketStatus.DONE)]
    service = _service(_StubProject(), tickets)
    report = await service.generate_weekly_status(_principal(Permission.REPORTS_VIEW), PROJECT)

    assert any("Write docs" in h for h in report.highlights)


@pytest.mark.asyncio
async def test_report_summary_and_health_are_deterministic() -> None:
    tickets = [_StubTicket("Write docs", TicketStatus.DONE)]
    service = _service(_StubProject(), tickets)
    report = await service.generate_weekly_status(_principal(Permission.REPORTS_VIEW), PROJECT)

    # One role headcount 2, one active assignment → one unfilled role → amber.
    assert report.health.status == HealthStatus.AMBER
    assert report.project_name == "Atlas"
    assert "Atlas" in report.summary
    assert report.progress.percent == 100
