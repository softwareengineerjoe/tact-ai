"""Project report responses (MASTER FR-017).

Reports are generated deterministically from existing project data. The AI may
narrate a report but never invents its figures.
"""

from datetime import datetime

from pydantic import BaseModel

from app.core.enums import ProjectStatus
from app.schemas.project_overview import (
    ProjectHealth,
    ProjectProgress,
    ProjectStaffing,
    ProjectTicketCounts,
)


class ReportTicketRef(BaseModel):
    ticket_id: str
    title: str


class WeeklyStatusReportRead(BaseModel):
    """A deterministic weekly project status report (MASTER FR-017)."""

    report_type: str = "weekly_status"
    project_id: str
    project_name: str
    status: ProjectStatus
    summary: str
    progress: ProjectProgress
    health: ProjectHealth
    staffing: ProjectStaffing
    tickets: ProjectTicketCounts
    highlights: list[str]
    risks: list[str]
    blocked_tickets: list[ReportTicketRef]
    overdue_tickets: list[ReportTicketRef]
    generated_at: datetime
