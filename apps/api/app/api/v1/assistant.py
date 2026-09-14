"""Assistant (chat) endpoints (MASTER 22, FR-020). Read-only in this phase."""

import asyncio
import json
import uuid
from collections.abc import AsyncIterator

from fastapi import APIRouter, Depends, status
from fastapi.responses import StreamingResponse

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

# Per-word delay while streaming so the reply arrives like natural typing
# rather than in one block (MASTER 23 — chat responses may use SSE).
_STREAM_WORD_DELAY_SECONDS = 0.035


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


@router.post("/sessions/{session_id}/messages/stream")
async def stream_message(
    session_id: uuid.UUID,
    payload: MessageCreate,
    principal: Principal = Depends(require_permission(Permission.ASSISTANT_USE)),
    service: AssistantService = Depends(get_assistant_service),
) -> StreamingResponse:
    """Stream the assistant's reply as Server-Sent Events (MASTER 23, FR-020).

    All persistence happens up front (the message is saved exactly as the
    non-streaming route), then the already-stored answer is emitted word by word
    so the client renders it progressively. No database access occurs inside the
    generator, keeping it independent of the request's session lifecycle.
    """
    message = await service.send_message(principal, session_id, content=payload.content)
    read = MessageRead.model_validate(message)
    final_payload = json.dumps(read.model_dump(mode="json"))
    words = read.content.split(" ")

    async def event_stream() -> AsyncIterator[str]:
        for index, word in enumerate(words):
            chunk = word if index == 0 else f" {word}"
            yield f"event: token\ndata: {json.dumps({'text': chunk})}\n\n"
            await asyncio.sleep(_STREAM_WORD_DELAY_SECONDS)
        yield f"event: done\ndata: {final_payload}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
