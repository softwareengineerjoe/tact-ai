"""Manager dashboard aggregate response (MASTER FR-015)."""

from datetime import datetime

from pydantic import BaseModel


class DashboardProjects(BaseModel):
    active: int
    awaiting_staffing: int
    total: int


class DashboardTickets(BaseModel):
    open: int
    blocked: int
    overdue: int
    in_review: int


class DashboardPeople(BaseModel):
    available: int
    fully_allocated: int
    overallocated: int
    total: int


class DashboardRead(BaseModel):
    """Management overview counts for the current organization."""

    projects: DashboardProjects
    tickets: DashboardTickets
    people: DashboardPeople
    generated_at: datetime
