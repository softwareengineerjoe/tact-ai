"""Native ticket endpoints (MASTER 22, FR-010)."""

import uuid

from fastapi import APIRouter, Depends, status

from app.api.deps import (
    get_principal,
    get_ticket_service,
    page_params,
    require_permission,
)
from app.schemas.common import Page, PageParams
from app.schemas.ticket import (
    CommentCreate,
    CommentRead,
    TicketAssign,
    TicketCreate,
    TicketDetailRead,
    TicketRead,
    TicketTransition,
    TicketUpdate,
)
from app.security.permissions import Permission
from app.security.principal import Principal
from app.services.ticket_service import TicketService

router = APIRouter(tags=["tickets"])


def _to_read(ticket) -> TicketRead:  # type: ignore[no-untyped-def]
    data = TicketRead.model_validate(ticket).model_dump(exclude={"assignee_name", "reviewer_name"})
    return TicketRead(
        **data,
        assignee_name=ticket.assignee.display_name if ticket.assignee else None,
        reviewer_name=ticket.reviewer.display_name if ticket.reviewer else None,
    )


@router.get("/tickets", response_model=Page[TicketRead])
async def list_tickets(
    principal: Principal = Depends(get_principal),
    service: TicketService = Depends(get_ticket_service),
    params: PageParams = Depends(page_params),
) -> Page[TicketRead]:
    items, total = await service.list_for_organization(principal, params)
    return Page(
        items=[_to_read(t) for t in items],
        total=total,
        page=params.page,
        page_size=params.page_size,
    )


@router.get("/projects/{project_id}/tickets", response_model=list[TicketRead])
async def list_project_tickets(
    project_id: uuid.UUID,
    principal: Principal = Depends(get_principal),
    service: TicketService = Depends(get_ticket_service),
) -> list[TicketRead]:
    items = await service.list_for_project(principal, project_id)
    return [_to_read(t) for t in items]


@router.get("/tickets/{ticket_id}", response_model=TicketDetailRead)
async def get_ticket(
    ticket_id: uuid.UUID,
    principal: Principal = Depends(get_principal),
    service: TicketService = Depends(get_ticket_service),
) -> TicketDetailRead:
    ticket = await service.get(principal, ticket_id)
    base = _to_read(ticket).model_dump()
    return TicketDetailRead(
        **base,
        comments=[CommentRead.model_validate(c) for c in ticket.comments],
        activity=sorted(
            (a for a in ticket.activity),
            key=lambda a: a.created_at,
            reverse=True,
        ),
    )


@router.post(
    "/projects/{project_id}/tickets",
    response_model=TicketRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_ticket(
    project_id: uuid.UUID,
    payload: TicketCreate,
    principal: Principal = Depends(require_permission(Permission.TICKETS_CREATE)),
    service: TicketService = Depends(get_ticket_service),
) -> TicketRead:
    ticket = await service.create(principal, project_id, payload)
    return _to_read(ticket)


@router.patch("/tickets/{ticket_id}", response_model=TicketRead)
async def update_ticket(
    ticket_id: uuid.UUID,
    payload: TicketUpdate,
    principal: Principal = Depends(require_permission(Permission.TICKETS_EDIT)),
    service: TicketService = Depends(get_ticket_service),
) -> TicketRead:
    ticket = await service.update(principal, ticket_id, payload)
    return _to_read(ticket)


@router.post("/tickets/{ticket_id}/assignment", response_model=TicketRead)
async def assign_ticket(
    ticket_id: uuid.UUID,
    payload: TicketAssign,
    principal: Principal = Depends(require_permission(Permission.TICKETS_ASSIGN)),
    service: TicketService = Depends(get_ticket_service),
) -> TicketRead:
    ticket = await service.assign(principal, ticket_id, payload)
    return _to_read(ticket)


@router.post("/tickets/{ticket_id}/transitions", response_model=TicketRead)
async def transition_ticket(
    ticket_id: uuid.UUID,
    payload: TicketTransition,
    principal: Principal = Depends(require_permission(Permission.TICKETS_TRANSITION)),
    service: TicketService = Depends(get_ticket_service),
) -> TicketRead:
    ticket = await service.transition(principal, ticket_id, payload)
    return _to_read(ticket)


@router.post(
    "/tickets/{ticket_id}/comments",
    response_model=CommentRead,
    status_code=status.HTTP_201_CREATED,
)
async def comment_ticket(
    ticket_id: uuid.UUID,
    payload: CommentCreate,
    principal: Principal = Depends(get_principal),
    service: TicketService = Depends(get_ticket_service),
) -> CommentRead:
    comment = await service.add_comment(principal, ticket_id, payload)
    return CommentRead.model_validate(comment)
