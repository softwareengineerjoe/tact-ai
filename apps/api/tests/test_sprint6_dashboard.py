"""Unit tests for the Sprint 6 manager dashboard (MASTER FR-015).

Stub repositories and a stub capacity service exercise the aggregation and
permission enforcement without a database.
"""

import uuid
from datetime import UTC, datetime

import pytest
from app.core.enums import AvailabilityStatus, ProjectStatus, TicketStatus
from app.core.exceptions import PermissionDenied
from app.security.permissions import Permission
from app.security.principal import Principal
from app.services.capacity_service import Capacity
from app.services.dashboard_service import DashboardService

ORG = uuid.UUID("00000000-0000-0000-0000-0000000000d1")


def _principal(*permissions: Permission) -> Principal:
    return Principal(
        user_id=uuid.uuid4(),
        organization_id=ORG,
        roles=frozenset(),
        permissions=frozenset(permissions),
    )


class StubProjectRepo:
    async def count_by_status(self, organization_id):  # type: ignore[no-untyped-def]
        assert organization_id == ORG
        return {
            ProjectStatus.ACTIVE: 2,
            ProjectStatus.STAFFING: 1,
            ProjectStatus.READY_FOR_APPROVAL: 1,
            ProjectStatus.DRAFT: 3,
        }


class StubTicketRepo:
    async def dashboard_counts(self, organization_id, *, now):  # type: ignore[no-untyped-def]
        assert organization_id == ORG
        return {"open": 5, "blocked": 2, "overdue": 1, "in_review": 3}


def _capacity(status: AvailabilityStatus) -> Capacity:
    now = datetime.now(UTC)
    return Capacity(
        employee_id=uuid.uuid4(),
        period_start=now,
        period_end=now,
        base_capacity_percent=100,
        approved_leave_percent=0,
        confirmed_allocation_percent=0,
        tentative_allocation_percent=0,
        remaining_capacity_percent=100,
        status=status,
        data_source="seed",
        last_updated=now,
    )


class StubCapacityService:
    async def compute_for_all(self, organization_id, *, period_start, period_end, params):  # type: ignore[no-untyped-def]
        assert organization_id == ORG
        return [
            _capacity(AvailabilityStatus.AVAILABLE),
            _capacity(AvailabilityStatus.PARTIALLY_AVAILABLE),
            _capacity(AvailabilityStatus.FULLY_ALLOCATED),
            _capacity(AvailabilityStatus.OVERALLOCATED),
            _capacity(AvailabilityStatus.UNAVAILABLE),
        ]


def _service() -> DashboardService:
    return DashboardService(
        StubProjectRepo(),  # type: ignore[arg-type]
        StubTicketRepo(),  # type: ignore[arg-type]
        StubCapacityService(),  # type: ignore[arg-type]
    )


@pytest.mark.asyncio
async def test_dashboard_requires_reports_view() -> None:
    service = _service()
    with pytest.raises(PermissionDenied):
        await service.get_overview(_principal())


@pytest.mark.asyncio
async def test_dashboard_aggregates_counts() -> None:
    service = _service()
    overview = await service.get_overview(_principal(Permission.REPORTS_VIEW))

    assert overview.projects.active == 2
    assert overview.projects.awaiting_staffing == 2
    assert overview.projects.total == 7

    assert overview.tickets.open == 5
    assert overview.tickets.blocked == 2
    assert overview.tickets.overdue == 1
    assert overview.tickets.in_review == 3

    assert overview.people.available == 2
    assert overview.people.fully_allocated == 1
    assert overview.people.overallocated == 1
    assert overview.people.total == 5


@pytest.mark.asyncio
async def test_dashboard_ticket_status_enum_untouched() -> None:
    # Guards against accidental status typos in the aggregation contract.
    assert TicketStatus.BLOCKED == "blocked"
