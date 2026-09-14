"""Team-member dashboard aggregate response (MASTER FR-016)."""

from datetime import datetime

from pydantic import BaseModel

from app.core.enums import AvailabilityStatus, ProjectStatus


class MemberEmployee(BaseModel):
    id: str
    display_name: str
    job_title: str | None


class MemberAllocation(BaseModel):
    confirmed_percent: int
    remaining_percent: int
    status: AvailabilityStatus


class MemberProject(BaseModel):
    project_id: str
    name: str
    status: ProjectStatus
    allocation_percent: int


class MemberTicketCounts(BaseModel):
    open: int
    blocked: int
    overdue: int
    review_requests: int


class MemberDeadline(BaseModel):
    ticket_id: str
    title: str
    due_date: datetime
    project_id: str


class MemberFeedback(BaseModel):
    shared_count: int


class MemberDashboardRead(BaseModel):
    """The employee's own view: work, allocation, and shared feedback (FR-016)."""

    employee: MemberEmployee
    allocation: MemberAllocation
    projects: list[MemberProject]
    tickets: MemberTicketCounts
    upcoming_deadlines: list[MemberDeadline]
    feedback: MemberFeedback
    generated_at: datetime
