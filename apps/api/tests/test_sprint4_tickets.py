"""Unit tests for Sprint 4 tickets (MASTER FR-010, §32).

Stub repositories run the rules without a database: permission enforcement,
the status state machine, the blocker-reason requirement, org isolation, and
optimistic-concurrency conflicts.
"""

import uuid

import pytest
from app.core.enums import TicketStatus
from app.core.exceptions import ConflictError, NotFound, PermissionDenied, ValidationError
from app.models.project import Project
from app.models.ticket import Ticket
from app.schemas.ticket import (
    CommentCreate,
    TicketCreate,
    TicketTransition,
)
from app.security.permissions import Permission
from app.security.principal import Principal
from app.services.ticket_service import TicketService

ORG = uuid.UUID("00000000-0000-0000-0000-0000000000b1")
OTHER_ORG = uuid.UUID("00000000-0000-0000-0000-0000000000b2")


def _principal(*permissions: Permission, organization_id: uuid.UUID = ORG) -> Principal:
    return Principal(
        user_id=uuid.uuid4(),
        organization_id=organization_id,
        roles=frozenset(),
        permissions=frozenset(permissions),
    )


class StubProjectRepo:
    def __init__(self, project: Project) -> None:
        self._project = project

    async def get(self, organization_id, project_id):  # type: ignore[no-untyped-def]
        if self._project.organization_id != organization_id:
            return None
        if self._project.id != project_id:
            return None
        return self._project


class StubTicketRepo:
    def __init__(self, tickets: list[Ticket] | None = None) -> None:
        self._tickets = tickets or []
        self.comments: list = []
        self.activity: list = []

    async def get(self, organization_id, ticket_id):  # type: ignore[no-untyped-def]
        for t in self._tickets:
            if t.id == ticket_id and t.organization_id == organization_id and t.deleted_at is None:
                return t
        return None

    async def get_with_detail(self, organization_id, ticket_id):  # type: ignore[no-untyped-def]
        return await self.get(organization_id, ticket_id)

    async def list_for_project(self, organization_id, project_id):  # type: ignore[no-untyped-def]
        return [
            t
            for t in self._tickets
            if t.organization_id == organization_id and t.project_id == project_id
        ]

    async def add(self, ticket):  # type: ignore[no-untyped-def]
        self._tickets.append(ticket)
        return ticket

    async def add_comment(self, comment):  # type: ignore[no-untyped-def]
        self.comments.append(comment)
        return comment

    async def add_activity(self, activity):  # type: ignore[no-untyped-def]
        self.activity.append(activity)
        return activity

    async def soft_delete(self, ticket):  # type: ignore[no-untyped-def]
        ticket.deleted_at = object()


def _project() -> Project:
    return Project(id=uuid.uuid4(), organization_id=ORG, name="Atlas")


def _ticket(project: Project, *, status: TicketStatus = TicketStatus.BACKLOG) -> Ticket:
    ticket = Ticket(
        id=uuid.uuid4(),
        organization_id=ORG,
        project_id=project.id,
        title="Do the thing",
        status=status,
    )
    ticket.version = 0
    ticket.assignee = None
    ticket.reviewer = None
    return ticket


def _service(project: Project, tickets: list[Ticket] | None = None) -> TicketService:
    return TicketService(StubTicketRepo(tickets), StubProjectRepo(project))  # type: ignore[arg-type]


# --- Creation & permissions ----------------------------------------------


@pytest.mark.asyncio
async def test_create_ticket_requires_permission() -> None:
    project = _project()
    service = _service(project)
    with pytest.raises(PermissionDenied):
        await service.create(
            _principal(Permission.TICKETS_VIEW),
            project.id,
            TicketCreate(title="New"),
        )


@pytest.mark.asyncio
async def test_create_ticket_starts_in_backlog_and_scopes_org() -> None:
    project = _project()
    service = _service(project)
    ticket = await service.create(
        _principal(Permission.TICKETS_CREATE),
        project.id,
        TicketCreate(title="New"),
    )
    assert ticket.status == TicketStatus.BACKLOG
    assert ticket.organization_id == ORG


@pytest.mark.asyncio
async def test_create_ticket_enforces_org_isolation() -> None:
    project = _project()
    service = _service(project)
    with pytest.raises(NotFound):
        await service.create(
            _principal(Permission.TICKETS_CREATE, organization_id=OTHER_ORG),
            project.id,
            TicketCreate(title="New"),
        )


# --- Transition state machine --------------------------------------------


@pytest.mark.asyncio
async def test_transition_rejects_illegal_move() -> None:
    project = _project()
    ticket = _ticket(project, status=TicketStatus.BACKLOG)
    service = _service(project, [ticket])
    with pytest.raises(ValidationError):
        await service.transition(
            _principal(Permission.TICKETS_TRANSITION),
            ticket.id,
            TicketTransition(status=TicketStatus.DONE, version=0),
        )


@pytest.mark.asyncio
async def test_transition_allows_legal_move() -> None:
    project = _project()
    ticket = _ticket(project, status=TicketStatus.IN_PROGRESS)
    service = _service(project, [ticket])
    updated = await service.transition(
        _principal(Permission.TICKETS_TRANSITION),
        ticket.id,
        TicketTransition(status=TicketStatus.IN_REVIEW, version=0),
    )
    assert updated.status == TicketStatus.IN_REVIEW
    assert updated.version == 1


@pytest.mark.asyncio
async def test_block_requires_reason() -> None:
    project = _project()
    ticket = _ticket(project, status=TicketStatus.IN_PROGRESS)
    service = _service(project, [ticket])
    with pytest.raises(ValidationError):
        await service.transition(
            _principal(Permission.TICKETS_TRANSITION),
            ticket.id,
            TicketTransition(status=TicketStatus.BLOCKED, version=0),
        )


@pytest.mark.asyncio
async def test_block_then_unblock_clears_reason() -> None:
    project = _project()
    ticket = _ticket(project, status=TicketStatus.IN_PROGRESS)
    service = _service(project, [ticket])
    blocked = await service.transition(
        _principal(Permission.TICKETS_TRANSITION),
        ticket.id,
        TicketTransition(status=TicketStatus.BLOCKED, blocker_reason="Waiting on API", version=0),
    )
    assert blocked.blocker_reason == "Waiting on API"
    unblocked = await service.transition(
        _principal(Permission.TICKETS_TRANSITION),
        ticket.id,
        TicketTransition(status=TicketStatus.IN_PROGRESS, version=1),
    )
    assert unblocked.blocker_reason is None


@pytest.mark.asyncio
async def test_transition_version_conflict() -> None:
    project = _project()
    ticket = _ticket(project, status=TicketStatus.READY)
    ticket.version = 4
    service = _service(project, [ticket])
    with pytest.raises(ConflictError):
        await service.transition(
            _principal(Permission.TICKETS_TRANSITION),
            ticket.id,
            TicketTransition(status=TicketStatus.IN_PROGRESS, version=1),
        )


# --- Comments -------------------------------------------------------------


@pytest.mark.asyncio
async def test_add_comment_records_activity() -> None:
    project = _project()
    ticket = _ticket(project)
    repo = StubTicketRepo([ticket])
    service = TicketService(repo, StubProjectRepo(project))  # type: ignore[arg-type]
    await service.add_comment(
        _principal(Permission.TICKETS_VIEW),
        ticket.id,
        CommentCreate(body="Looks good"),
    )
    assert len(repo.comments) == 1
    assert any(a.action == "commented" for a in repo.activity)
