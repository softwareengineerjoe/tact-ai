"""Secured read-only agent tools (MASTER 15.3, 15.5, 39.6).

Tools are thin wrappers over the application services. Each one is passed the
caller's ``Principal`` and calls a service that re-checks authorization, so a
tool can never read data the user is not allowed to see. Tools never touch the
database directly and never mutate state — Sprint 5 is read-only (MASTER 30).

Each tool returns a ``ToolResult`` carrying JSON-serializable ``data`` and a
list of structured ``Citation`` source references (MASTER 15.7).
"""

import uuid
from collections.abc import Awaitable, Callable
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

from app.models.employee import Employee
from app.models.feedback import Feedback
from app.models.project import Project
from app.models.ticket import Ticket
from app.schemas.common import PageParams
from app.security.principal import Principal
from app.services.employee_service import EmployeeService
from app.services.feedback_service import FeedbackService
from app.services.project_service import ProjectService
from app.services.ticket_service import TicketService


@dataclass(frozen=True, slots=True)
class Citation:
    source_type: str
    source_id: str
    label: str


@dataclass(frozen=True, slots=True)
class ToolResult:
    data: Any
    citations: list[Citation] = field(default_factory=list)


@dataclass(frozen=True, slots=True)
class ToolContext:
    """Everything a tool needs: the caller and the authorized services."""

    principal: Principal
    projects: ProjectService
    employees: EmployeeService
    tickets: TicketService
    feedback: FeedbackService


ToolFn = Callable[[ToolContext, dict[str, Any]], Awaitable[ToolResult]]


@dataclass(frozen=True, slots=True)
class Tool:
    name: str
    description: str
    parameters: dict[str, Any]
    run: ToolFn


def _iso(value: datetime | None) -> str | None:
    return value.isoformat() if value is not None else None


def _project_summary(project: Project) -> dict[str, Any]:
    return {
        "id": str(project.id),
        "name": project.name,
        "status": project.status,
        "priority": project.priority,
        "start_date": _iso(project.start_date),
        "target_end_date": _iso(project.target_end_date),
    }


def _employee_summary(employee: Employee) -> dict[str, Any]:
    return {
        "id": str(employee.id),
        "display_name": employee.display_name,
        "job_title": employee.job_title,
        "department": employee.department,
        "employment_status": employee.employment_status,
    }


def _ticket_summary(ticket: Ticket) -> dict[str, Any]:
    return {
        "id": str(ticket.id),
        "title": ticket.title,
        "status": ticket.status,
        "priority": ticket.priority,
        "assignee_id": str(ticket.assignee_id) if ticket.assignee_id else None,
        "due_date": _iso(ticket.due_date),
        "blocker_reason": ticket.blocker_reason,
    }


def _feedback_summary(feedback: Feedback) -> dict[str, Any]:
    return {
        "id": str(feedback.id),
        "employee_id": str(feedback.employee_id),
        "project_id": str(feedback.project_id),
        "category": feedback.category,
        "visibility": feedback.visibility,
        "status": feedback.status,
    }


def _require_uuid(arguments: dict[str, Any], key: str) -> uuid.UUID:
    raw = arguments.get(key)
    if not raw:
        raise ValueError(f"Missing required argument: {key}")
    try:
        return uuid.UUID(str(raw))
    except ValueError as exc:  # noqa: TRY003
        raise ValueError(f"Invalid uuid for {key}: {raw}") from exc


async def _search_projects(ctx: ToolContext, arguments: dict[str, Any]) -> ToolResult:
    params = PageParams(page=1, page_size=20)
    search = arguments.get("search")
    status = arguments.get("status")
    projects, total = await ctx.projects.list_projects(
        ctx.principal, params, status=status, search=search
    )
    return ToolResult(
        data={"total": total, "items": [_project_summary(p) for p in projects]},
        citations=[Citation("project", str(p.id), p.name) for p in projects],
    )


async def _get_project(ctx: ToolContext, arguments: dict[str, Any]) -> ToolResult:
    project_id = _require_uuid(arguments, "project_id")
    project = await ctx.projects.get_project(ctx.principal, project_id)
    return ToolResult(
        data=_project_summary(project),
        citations=[Citation("project", str(project.id), project.name)],
    )


async def _search_employees(ctx: ToolContext, arguments: dict[str, Any]) -> ToolResult:
    params = PageParams(page=1, page_size=20)
    employees, total = await ctx.employees.list_employees(
        ctx.principal,
        params,
        search=arguments.get("search"),
        department=arguments.get("department"),
        employment_status=arguments.get("employment_status"),
    )
    return ToolResult(
        data={"total": total, "items": [_employee_summary(e) for e in employees]},
        citations=[Citation("employee", str(e.id), e.display_name) for e in employees],
    )


async def _get_project_tickets(ctx: ToolContext, arguments: dict[str, Any]) -> ToolResult:
    project_id = _require_uuid(arguments, "project_id")
    tickets = await ctx.tickets.list_for_project(ctx.principal, project_id)
    return ToolResult(
        data={"items": [_ticket_summary(t) for t in tickets]},
        citations=[Citation("ticket", str(t.id), t.title) for t in tickets],
    )


async def _get_project_feedback(ctx: ToolContext, arguments: dict[str, Any]) -> ToolResult:
    project_id = _require_uuid(arguments, "project_id")
    feedback = await ctx.feedback.list_for_project(ctx.principal, project_id)
    return ToolResult(
        data={"items": [_feedback_summary(f) for f in feedback]},
        citations=[Citation("feedback", str(f.id), f"Feedback {f.id}") for f in feedback],
    )


TOOLS: dict[str, Tool] = {
    "search_projects": Tool(
        name="search_projects",
        description="List projects the user can view, filtered by status or search text.",
        parameters={
            "type": "object",
            "properties": {
                "search": {"type": "string", "description": "Optional name search."},
                "status": {"type": "string", "description": "Optional project status filter."},
            },
        },
        run=_search_projects,
    ),
    "get_project": Tool(
        name="get_project",
        description="Get a single project's summary by its id.",
        parameters={
            "type": "object",
            "properties": {"project_id": {"type": "string"}},
            "required": ["project_id"],
        },
        run=_get_project,
    ),
    "search_employees": Tool(
        name="search_employees",
        description="Search employees by name, department, or employment status.",
        parameters={
            "type": "object",
            "properties": {
                "search": {"type": "string"},
                "department": {"type": "string"},
                "employment_status": {"type": "string"},
            },
        },
        run=_search_employees,
    ),
    "get_project_tickets": Tool(
        name="get_project_tickets",
        description="List the tickets for a project, including status and blockers.",
        parameters={
            "type": "object",
            "properties": {"project_id": {"type": "string"}},
            "required": ["project_id"],
        },
        run=_get_project_tickets,
    ),
    "get_project_feedback": Tool(
        name="get_project_feedback",
        description="List feedback for a project the user is authorized to read.",
        parameters={
            "type": "object",
            "properties": {"project_id": {"type": "string"}},
            "required": ["project_id"],
        },
        run=_get_project_feedback,
    ),
}


def tool_specs() -> list[dict[str, Any]]:
    """OpenAI-style function specs for the model (MASTER 15.3)."""
    return [
        {
            "type": "function",
            "name": tool.name,
            "description": tool.description,
            "parameters": tool.parameters,
        }
        for tool in TOOLS.values()
    ]
