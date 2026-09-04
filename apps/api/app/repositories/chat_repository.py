"""Org-scoped persistence for the chat aggregate (MASTER 15.8, 21)."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.chat import ChatMessage, ChatSession


class ChatRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def add_session(self, session: ChatSession) -> ChatSession:
        self._session.add(session)
        await self._session.flush()
        return session

    async def get_session(
        self, organization_id: uuid.UUID, session_id: uuid.UUID
    ) -> ChatSession | None:
        stmt = (
            select(ChatSession)
            .where(
                ChatSession.id == session_id,
                ChatSession.organization_id == organization_id,
                ChatSession.deleted_at.is_(None),
            )
            .options(
                selectinload(ChatSession.messages).selectinload(ChatMessage.citations),
            )
        )
        result: ChatSession | None = await self._session.scalar(stmt)
        return result

    async def list_sessions(
        self, organization_id: uuid.UUID, user_id: uuid.UUID
    ) -> list[ChatSession]:
        stmt = (
            select(ChatSession)
            .where(
                ChatSession.organization_id == organization_id,
                ChatSession.user_id == user_id,
                ChatSession.deleted_at.is_(None),
            )
            .order_by(ChatSession.created_at.desc())
        )
        return list(await self._session.scalars(stmt))

    async def add_message(self, message: ChatMessage) -> ChatMessage:
        self._session.add(message)
        await self._session.flush()
        return message

    async def reload_message(
        self, organization_id: uuid.UUID, message_id: uuid.UUID
    ) -> ChatMessage:
        """Reload a message with its citations eager-loaded so serialization
        never triggers a lazy load outside the async context."""
        stmt = (
            select(ChatMessage)
            .where(
                ChatMessage.id == message_id,
                ChatMessage.organization_id == organization_id,
            )
            .options(selectinload(ChatMessage.citations))
        )
        result = await self._session.scalar(stmt)
        assert result is not None  # noqa: S101 — just-inserted row
        return result
