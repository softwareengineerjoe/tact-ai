"""Deterministic date-based capacity calculation (MASTER FR-006).

Capacity is computed, never guessed. Unknown availability is never treated as
available. The AI layer may explain these numbers but never computes them.
"""

import uuid
from dataclasses import dataclass
from datetime import datetime

from app.core.enums import AvailabilityStatus, EmploymentStatus
from app.models.employee import Employee, EmployeeAvailability
from app.repositories.assignment_repository import AssignmentRepository
from app.repositories.employee_repository import EmployeeRepository
from app.schemas.common import PageParams


@dataclass(frozen=True, slots=True)
class Capacity:
    """Computed capacity for one employee over a period."""

    employee_id: uuid.UUID
    period_start: datetime
    period_end: datetime
    base_capacity_percent: int
    approved_leave_percent: int
    confirmed_allocation_percent: int
    tentative_allocation_percent: int
    remaining_capacity_percent: int
    status: AvailabilityStatus
    data_source: str | None
    last_updated: datetime | None


class CapacityService:
    def __init__(
        self,
        employee_repository: EmployeeRepository,
        assignment_repository: AssignmentRepository,
    ) -> None:
        self._employees = employee_repository
        self._assignments = assignment_repository

    async def compute_for_employee(
        self,
        organization_id: uuid.UUID,
        employee: Employee,
        *,
        period_start: datetime,
        period_end: datetime,
    ) -> Capacity:
        availability = await self._employees.list_availability(organization_id, employee.id)
        record = _select_overlapping(availability, period_start, period_end)

        assignments = await self._assignments.list_active_for_employee(
            organization_id,
            employee.id,
            period_start=period_start,
            period_end=period_end,
        )
        confirmed = sum(
            a.allocation_percent for a in assignments if AssignmentRepository.is_confirmed(a.status)
        )
        tentative = sum(
            a.allocation_percent for a in assignments if AssignmentRepository.is_tentative(a.status)
        )

        # No availability record, or the employee is not active → Unknown/unavailable.
        if record is None or employee.employment_status != EmploymentStatus.ACTIVE:
            status = (
                AvailabilityStatus.UNAVAILABLE
                if employee.employment_status != EmploymentStatus.ACTIVE
                else AvailabilityStatus.UNKNOWN
            )
            return Capacity(
                employee_id=employee.id,
                period_start=period_start,
                period_end=period_end,
                base_capacity_percent=0,
                approved_leave_percent=0,
                confirmed_allocation_percent=confirmed,
                tentative_allocation_percent=tentative,
                remaining_capacity_percent=0,
                status=status,
                data_source=None,
                last_updated=None,
            )

        base = record.base_capacity_percent
        remaining = base - confirmed - tentative
        status = _derive_status(record.status, base, remaining)

        return Capacity(
            employee_id=employee.id,
            period_start=period_start,
            period_end=period_end,
            base_capacity_percent=base,
            approved_leave_percent=0,
            confirmed_allocation_percent=confirmed,
            tentative_allocation_percent=tentative,
            remaining_capacity_percent=remaining,
            status=status,
            data_source=record.data_source,
            last_updated=record.updated_at,
        )

    async def compute_for_all(
        self,
        organization_id: uuid.UUID,
        *,
        period_start: datetime,
        period_end: datetime,
        params: PageParams,
    ) -> list[Capacity]:
        employees, _ = await self._employees.list_page(
            organization_id, limit=params.page_size, offset=params.offset
        )
        return [
            await self.compute_for_employee(
                organization_id,
                employee,
                period_start=period_start,
                period_end=period_end,
            )
            for employee in employees
        ]


def _select_overlapping(
    records: list[EmployeeAvailability],
    period_start: datetime,
    period_end: datetime,
) -> EmployeeAvailability | None:
    """The most recently updated availability record overlapping the period."""
    overlapping = [
        r for r in records if r.period_start <= period_end and r.period_end >= period_start
    ]
    if not overlapping:
        return None
    return max(overlapping, key=lambda r: r.updated_at)


def _derive_status(record_status: str, base: int, remaining: int) -> AvailabilityStatus:
    if record_status == AvailabilityStatus.UNAVAILABLE or base <= 0:
        return AvailabilityStatus.UNAVAILABLE
    if remaining < 0:
        return AvailabilityStatus.OVERALLOCATED
    if remaining == 0:
        return AvailabilityStatus.FULLY_ALLOCATED
    if remaining >= base:
        return AvailabilityStatus.AVAILABLE
    return AvailabilityStatus.PARTIALLY_AVAILABLE
