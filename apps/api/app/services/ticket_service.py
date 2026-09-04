"""Native ticket management: CRUD, transitions, blockers, comments (FR-010).

Business rules live here (MASTER 1–5): the status state machine, the rule that
moving to BLOCKED requires a reason, assignment, and immutable activity history.
Every action is org-scoped and permission-checked.
"""

import uuid

from app.core.enums import TicketStatus
from app.core.exceptions import ConflictError, NotFound, ValidationError
from app.models.ticket import Ticket, TicketActivity, TicketComment
from app.repositories.project_repository import ProjectRepository
from app.repositories.ticket_repository import TicketRepository
from app.schemas.common import PageParams
from app.schemas.ticket import (
    CommentCreate,
    TicketAssign,
    TicketCreate,
    TicketTransition,
    TicketUpdate,
)
from app.security.permissions import Permission
from app.security.principal import Principal

# Allowed status transitions (MASTER FR-010 main + exception flows).
_ALLOWED_TRANSITIONS: dict[TicketStatus, frozenset[TicketStatus]] = {
    TicketStatus.BACKLOG: frozenset({TicketStatus.READY, TicketStatus.CANCELLED}),
    TicketStatus.READY: frozenset(
        {TicketStatus.IN_PROGRESS, TicketStatus.BACKLOG, TicketStatus.CANCELLED}
    ),
    TicketStatus.IN_PROGRESS: frozenset(
        {TicketStatus.IN_REVIEW, TicketStatus.BLOCKED, TicketStatus.CANCELLED}
    ),
    TicketStatus.BLOCKED: frozenset({TicketStatus.IN_PROGRESS, TicketStatus.CANCELLED}),
    TicketStatus.IN_REVIEW: frozenset(
        {TicketStatus.DONE, TicketStatus.IN_PROGRESS, TicketStatus.CANCELLED}
    ),
    TicketStatus.DONE: frozenset(),
    TicketStatus.CANCELLED: frozenset(),
}


class TicketService:
    def __init__(
        self,
        ticket_repository: TicketRepository,
        project_repository: ProjectRepository,
    ) -> None:
        self._tickets = ticket_repository
        self._projects = project_repository

    async def list_for_project(self, principal: Principal, project_id: uuid.UUID) -> list[Ticket]:
        principal.require(Permission.TICKETS_VIEW)
        await self._require_project(principal, project_id)
        return await self._tickets.list_for_project(principal.organization_id, project_id)

    async def list_for_organization(
        self, principal: Principal, params: PageParams
    ) -> tuple[list[Ticket], int]:
        principal.require(Permission.TICKETS_VIEW)
        return await self._tickets.list_for_organization(
            principal.organization_id, limit=params.page_size, offset=params.offset
        )

    async def get(self, principal: Principal, ticket_id: uuid.UUID) -> Ticket:
        principal.require(Permission.TICKETS_VIEW)
        ticket = await self._tickets.get_with_detail(principal.organization_id, ticket_id)
        if ticket is None:
            raise NotFound("Ticket not found")
        return ticket

    async def create(
        self, principal: Principal, project_id: uuid.UUID, data: TicketCreate
    ) -> Ticket:
        principal.require(Permission.TICKETS_CREATE)
        await self._require_project(principal, project_id)

        ticket = Ticket(
            organization_id=principal.organization_id,
            project_id=project_id,
            title=data.title,
            description=data.description,
            ticket_type=data.ticket_type,
            priority=data.priority,
            status=TicketStatus.BACKLOG,
            assignee_id=data.assignee_id,
            reviewer_id=data.reviewer_id,
            story_points=data.story_points,
            due_date=data.due_date,
        )
        created = await self._tickets.add(ticket)
        await self._record(principal, created, "created", data.title)
        return created

    async def update(
        self, principal: Principal, ticket_id: uuid.UUID, data: TicketUpdate
    ) -> Ticket:
        principal.require(Permission.TICKETS_EDIT)
        ticket = await self._require_ticket(principal, ticket_id)
        self._check_version(ticket, data.version)

        if data.title is not None:
            ticket.title = data.title
        if data.description is not None:
            ticket.description = data.description
        if data.ticket_type is not None:
            ticket.ticket_type = data.ticket_type
        if data.priority is not None:
            ticket.priority = data.priority
        if data.story_points is not None:
            ticket.story_points = data.story_points
        if data.due_date is not None:
            ticket.due_date = data.due_date
        ticket.version += 1
        await self._record(principal, ticket, "updated", None)
        return ticket

    async def assign(
        self, principal: Principal, ticket_id: uuid.UUID, data: TicketAssign
    ) -> Ticket:
        principal.require(Permission.TICKETS_ASSIGN)
        ticket = await self._require_ticket(principal, ticket_id)
        self._check_version(ticket, data.version)

        ticket.assignee_id = data.assignee_id
        ticket.reviewer_id = data.reviewer_id
        ticket.version += 1
        await self._record(principal, ticket, "assigned", None)
        return ticket

    async def transition(
        self, principal: Principal, ticket_id: uuid.UUID, data: TicketTransition
    ) -> Ticket:
        principal.require(Permission.TICKETS_TRANSITION)
        ticket = await self._require_ticket(principal, ticket_id)
        self._check_version(ticket, data.version)

        current = TicketStatus(ticket.status)
        target = data.status
        if target != current and target not in _ALLOWED_TRANSITIONS.get(current, frozenset()):
            raise ValidationError(f"Cannot move ticket from {current} to {target}")

        if target == TicketStatus.BLOCKED and not data.blocker_reason:
            raise ValidationError("A blocker reason is required to block a ticket")

        ticket.status = target
        # Record the blocker reason on entry; clear it when unblocked.
        if target == TicketStatus.BLOCKED:
            ticket.blocker_reason = data.blocker_reason
        elif current == TicketStatus.BLOCKED:
            ticket.blocker_reason = None
        ticket.version += 1
        await self._record(principal, ticket, "transitioned", f"{current} → {target}")
        return ticket

    async def add_comment(
        self, principal: Principal, ticket_id: uuid.UUID, data: CommentCreate
    ) -> TicketComment:
        principal.require(Permission.TICKETS_VIEW)
        ticket = await self._require_ticket(principal, ticket_id)
        comment = TicketComment(
            organization_id=principal.organization_id,
            ticket_id=ticket.id,
            author_id=principal.user_id,
            body=data.body,
        )
        created = await self._tickets.add_comment(comment)
        await self._record(principal, ticket, "commented", None)
        return created

    async def delete(self, principal: Principal, ticket_id: uuid.UUID, *, version: int) -> None:
        principal.require(Permission.TICKETS_EDIT)
        ticket = await self._require_ticket(principal, ticket_id)
        self._check_version(ticket, version)
        await self._tickets.soft_delete(ticket)

    # --- helpers ---------------------------------------------------------

    async def _record(
        self, principal: Principal, ticket: Ticket, action: str, detail: str | None
    ) -> None:
        await self._tickets.add_activity(
            TicketActivity(
                organization_id=principal.organization_id,
                ticket_id=ticket.id,
                actor_id=principal.user_id,
                action=action,
                detail=detail,
            )
        )

    async def _require_project(self, principal: Principal, project_id: uuid.UUID) -> None:
        project = await self._projects.get(principal.organization_id, project_id)
        if project is None:
            raise NotFound("Project not found")

    async def _require_ticket(self, principal: Principal, ticket_id: uuid.UUID) -> Ticket:
        ticket = await self._tickets.get(principal.organization_id, ticket_id)
        if ticket is None:
            raise NotFound("Ticket not found")
        return ticket

    @staticmethod
    def _check_version(ticket: Ticket, version: int) -> None:
        if ticket.version != version:
            raise ConflictError("Ticket was modified by someone else")
