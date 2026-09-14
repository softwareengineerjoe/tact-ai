"""Project overview: deterministic progress + rule-based health (FR-013, FR-014)."""

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel

from app.core.enums import ProjectStatus


class ProgressMethod(StrEnum):
    """Which formula produced the progress figure (MASTER FR-013)."""

    STORY_POINTS = "story_points"
    TICKETS = "tickets"


class HealthStatus(StrEnum):
    """Rule-based project health (MASTER FR-014)."""

    GREEN = "green"
    AMBER = "amber"
    RED = "red"


class ProjectProgress(BaseModel):
    method: ProgressMethod
    completed: int
    total: int
    percent: int  # 0–100, rounded


class ProjectHealth(BaseModel):
    status: HealthStatus
    reasons: list[str]


class ProjectStaffing(BaseModel):
    required_headcount: int
    filled_headcount: int
    unfilled_roles: int


class ProjectTicketCounts(BaseModel):
    total: int
    open: int
    blocked: int
    overdue: int
    done: int


class ProjectOverviewRead(BaseModel):
    """Aggregated, read-only project health snapshot (MASTER FR-013, FR-014)."""

    project_id: str
    status: ProjectStatus
    progress: ProjectProgress
    health: ProjectHealth
    staffing: ProjectStaffing
    tickets: ProjectTicketCounts
    generated_at: datetime
