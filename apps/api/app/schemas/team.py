"""Capacity, recommendation, and assignment schemas (MASTER FR-006/007/008/009)."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.core.enums import AssignmentStatus, AvailabilityStatus


class CapacityRead(BaseModel):
    """Computed capacity for an employee over a period (MASTER FR-006)."""

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


class RecommendationRequest(BaseModel):
    role_requirement_id: uuid.UUID
    period_start: datetime
    period_end: datetime
    limit: int = Field(default=10, ge=1, le=50)


class RecommendationCandidate(BaseModel):
    employee_id: uuid.UUID
    display_name: str
    role_requirement_id: uuid.UUID
    project_fit_score: int
    matched_skills: list[str]
    missing_skills: list[str]
    remaining_capacity_percent: int
    data_freshness: datetime | None
    warnings: list[str]
    recommendation_reason: str


class ReservationCreate(BaseModel):
    role_requirement_id: uuid.UUID
    employee_id: uuid.UUID
    allocation_percent: int = Field(default=100, ge=0, le=100)
    expires_at: datetime


class AssignmentCreate(BaseModel):
    role_requirement_id: uuid.UUID
    employee_id: uuid.UUID
    allocation_percent: int = Field(default=100, ge=0, le=100)
    start_date: datetime
    end_date: datetime
    # Required only when confirming an overallocated employee (MASTER FR-008).
    override_reason: str | None = None


class AssignmentUpdate(BaseModel):
    status: AssignmentStatus
    override_reason: str | None = None
    version: int  # optimistic concurrency (MASTER 23)


class AssignmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organization_id: uuid.UUID
    project_id: uuid.UUID
    role_requirement_id: uuid.UUID
    employee_id: uuid.UUID
    status: AssignmentStatus
    allocation_percent: int
    start_date: datetime | None
    end_date: datetime | None
    expires_at: datetime | None
    override_reason: str | None
    version: int
    created_at: datetime
    updated_at: datetime


class AssignmentCreateResult(BaseModel):
    """A confirmed assignment plus any non-blocking warnings (e.g. override)."""

    assignment: AssignmentRead
    warnings: list[str] = Field(default_factory=list)
