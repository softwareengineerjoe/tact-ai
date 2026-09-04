"""Assistant (chat) endpoints (MASTER 22, FR-020). Read-only in this phase."""

import uuid

from fastapi import APIRouter, Depends, status

from app.api.deps import get_assistant_service, require_permission
from app.schemas.assistant import (
    MessageCreate,
    MessageRead,
    SessionCreate,
    SessionDetailRead,
    SessionRead,
)
from app.security.permissions import Permission
from app.security.principal import Principal
from app.services.assistant_service import AssistantService

router = APIRouter(prefix="/assistant", tags=["assistant"])


@router.post(
    "/sessions",
    response_model=SessionRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_session(
    payload: SessionCreate,
    principal: Principal = Depends(require_permission(Permission.ASSISTANT_USE)),
    service: AssistantService = Depends(get_assistant_service),
) -> SessionRead:
    session = await service.create_session(principal, title=payload.title)
    return SessionRead.model_validate(session)


@router.get("/sessions", response_model=list[SessionRead])
async def list_sessions(
    principal: Principal = Depends(require_permission(Permission.ASSISTANT_USE)),
    service: AssistantService = Depends(get_assistant_service),
) -> list[SessionRead]:
    sessions = await service.list_sessions(principal)
    return [SessionRead.model_validate(s) for s in sessions]


@router.get("/sessions/{session_id}", response_model=SessionDetailRead)
async def get_session(
    session_id: uuid.UUID,
    principal: Principal = Depends(require_permission(Permission.ASSISTANT_USE)),
    service: AssistantService = Depends(get_assistant_service),
) -> SessionDetailRead:
    session = await service.get_session(principal, session_id)
    return SessionDetailRead.model_validate(session)


@router.post(
    "/sessions/{session_id}/messages",
    response_model=MessageRead,
    status_code=status.HTTP_201_CREATED,
)
async def send_message(
    session_id: uuid.UUID,
    payload: MessageCreate,
    principal: Principal = Depends(require_permission(Permission.ASSISTANT_USE)),
    service: AssistantService = Depends(get_assistant_service),
) -> MessageRead:
    message = await service.send_message(principal, session_id, content=payload.content)
    return MessageRead.model_validate(message)
