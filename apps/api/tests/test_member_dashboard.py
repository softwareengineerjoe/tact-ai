"""Unit tests for the team-member dashboard (MASTER FR-016).

Stub repositories and a stub capacity service exercise aggregation, permission
enforcement, and the shared-feedback gate without a database.
"""

import uuid
from datetime import UTC, datetime, timedelta

import pytest
from app.core.enums import (
    AssignmentStatus,
    AvailabilityStatus,
    ProjectStatus,
    TicketStatus,
)
from app.core.exceptions import NotFound, PermissionDenied
from app.security.permissions import Permission
from app.security.principal import Principal
from app.services.capacity_service import Capacity
from app.services.member_dashboard_service import MemberDashboardService

ORG = uuid.UUID("00000000-0000-0000-0000-0000000000f1")
EMPLOYEE = uuid.UUID("00000000-0000-0000-0000-0000000000f2")
PROJECT = uuid.UUID("00000000-0000-0000-0000-0000000000f3")
NOW = datetime.now(UTC)


def _principal(*permissions: Permission) -> Principal:
    return Principal(
        user_id=uuid.uuid4(),
        organization_id=ORG,
        roles=frozenset(),
        permissions=frozenset(permissions),
    )


class _Employee:
    id = EMPLOYEE
    display_name = "Maria Santos"
    job_title = "Backend Developer"
    employment_status = "active"


class StubEmployeeRepo:
    def __init__(self, employee: object | None) -> None:
        self._employee = employee

    async def get(self, organization_id, employee_id):  # type: ignore[no-untyped-def]
        return self._employee


class _Assignment:
    def __init__(self, status: str, allocation: int) -> None:
        self.project_id = PROJECT
        self.status = status
        self.allocation_percent = allocation


class StubAssignmentRepo:
    async def list_active_for_employee(  # type: ignore[no-untyped-def]
        self, organization_id, employee_id, *, period_start, period_end, exclude_assignment_id=None
    ):
        return [_Assignment(AssignmentStatus.ACTIVE, 60)]


class _Ticket:
    def __init__(
        self,
        *,
        assignee_id=None,
        reviewer_id=None,
        status=TicketStatus.IN_PROGRESS,
        due_date=None,
    ) -> None:
        self.id = uuid.uuid4()
        self.project_id = PROJECT
        self.title = "Ticket"
        self.assignee_id = assignee_id
        self.reviewer_id = reviewer_id
        self.status = status
        self.due_date = due_date


class StubTicketRepo:
    def __init__(self, tickets) -> None:  # type: ignore[no-untyped-def]
        self._tickets = tickets

    async def list_for_employee(self, organization_id, employee_id):  # type: ignore[no-untyped-def]
        return self._tickets


class _Project:
    id = PROJECT
    name = "Project Helios"
    status = ProjectStatus.ACTIVE


class StubProjectRepo:
    async def get(self, organization_id, project_id):  # type: ignore[no-untyped-def]
        return _Project()


class StubFeedbackRepo:
    async def list_for_employee(self, organization_id, employee_id, *, include_private):  # type: ignore[no-untyped-def]
        assert include_private is False
        return [object(), object()]


class StubCapacityService:
    async def compute_for_employee(  # type: ignore[no-untyped-def]
        self, organization_id, employee, *, period_start, period_end, exclude_assignment_id=None
    ):
        return Capacity(
            employee_id=EMPLOYEE,
            period_start=period_start,
            period_end=period_end,
            base_capacity_percent=100,
            approved_leave_percent=0,
            confirmed_allocation_percent=60,
            tentative_allocation_percent=0,
            remaining_capacity_percent=40,
            status=AvailabilityStatus.PARTIALLY_AVAILABLE,
            data_source="seed",
            last_updated=NOW,
        )


def _service(tickets=None, employee=_Employee()) -> MemberDashboardService:  # type: ignore[no-untyped-def]
    return MemberDashboardService(
        StubEmployeeRepo(employee),  # type: ignore[arg-type]
        StubAssignmentRepo(),  # type: ignore[arg-type]
        StubTicketRepo(tickets or []),  # type: ignore[arg-type]
        StubProjectRepo(),  # type: ignore[arg-type]
        StubFeedbackRepo(),  # type: ignore[arg-type]
        StubCapacityService(),  # type: ignore[arg-type]
    )


@pytest.mark.asyncio
async def test_dashboard_requires_people_view() -> None:
    with pytest.raises(PermissionDenied):
        await _service().get_overview(_principal(), EMPLOYEE)


@pytest.mark.asyncio
async def test_dashboard_missing_employee_raises_not_found() -> None:
    service = _service(employee=None)
    with pytest.raises(NotFound):
        await service.get_overview(_principal(Permission.PEOPLE_VIEW), EMPLOYEE)


@pytest.mark.asyncio
async def test_dashboard_aggregates_projects_and_allocation() -> None:
    service = _service()
    overview = await service.get_overview(_principal(Permission.PEOPLE_VIEW), EMPLOYEE)

    assert overview.employee.display_name == "Maria Santos"
    assert overview.allocation.confirmed_percent == 60
    assert overview.allocation.remaining_percent == 40
    assert len(overview.projects) == 1
    assert overview.projects[0].name == "Project Helios"
    assert overview.projects[0].allocation_percent == 60


@pytest.mark.asyncio
async def test_dashboard_splits_tickets_and_deadlines() -> None:
    tickets = [
        _Ticket(assignee_id=EMPLOYEE, status=TicketStatus.IN_PROGRESS),
        _Ticket(assignee_id=EMPLOYEE, status=TicketStatus.BLOCKED),
        _Ticket(
            assignee_id=EMPLOYEE,
            status=TicketStatus.IN_PROGRESS,
            due_date=NOW - timedelta(days=1),  # overdue
        ),
        _Ticket(
            assignee_id=EMPLOYEE,
            status=TicketStatus.READY,
            due_date=NOW + timedelta(days=3),  # upcoming
        ),
        _Ticket(reviewer_id=EMPLOYEE, status=TicketStatus.IN_REVIEW),  # review request
        _Ticket(assignee_id=EMPLOYEE, status=TicketStatus.DONE),  # closed, excluded
    ]
    service = _service(tickets=tickets)
    overview = await service.get_overview(_principal(Permission.PEOPLE_VIEW), EMPLOYEE)

    assert overview.tickets.open == 4  # 4 assigned & not closed
    assert overview.tickets.blocked == 1
    assert overview.tickets.overdue == 1
    assert overview.tickets.review_requests == 1
    assert len(overview.upcoming_deadlines) == 1


@pytest.mark.asyncio
async def test_shared_feedback_gated_on_permission() -> None:
    service = _service()

    without = await service.get_overview(_principal(Permission.PEOPLE_VIEW), EMPLOYEE)
    assert without.feedback.shared_count == 0

    with_perm = await service.get_overview(
        _principal(Permission.PEOPLE_VIEW, Permission.FEEDBACK_VIEW_SHARED), EMPLOYEE
    )
    assert with_perm.feedback.shared_count == 2
