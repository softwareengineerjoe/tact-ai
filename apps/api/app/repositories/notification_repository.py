"""Org-scoped persistence for per-recipient notifications (MASTER FR-018)."""

import uuid
from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification


class NotificationRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_for_recipient(
        self, organization_id: uuid.UUID, recipient_id: uuid.UUID, notification_id: uuid.UUID
    ) -> Notification | None:
        stmt = select(Notification).where(
            Notification.id == notification_id,
            Notification.organization_id == organization_id,
            Notification.recipient_id == recipient_id,
            Notification.deleted_at.is_(None),
        )
        result: Notification | None = await self._session.scalar(stmt)
        return result

    async def list_for_recipient(
        self,
        organization_id: uuid.UUID,
        recipient_id: uuid.UUID,
        *,
        unread_only: bool,
        limit: int,
        offset: int,
    ) -> tuple[list[Notification], int]:
        base = select(Notification).where(
            Notification.organization_id == organization_id,
            Notification.recipient_id == recipient_id,
            Notification.deleted_at.is_(None),
        )
        if unread_only:
            base = base.where(Notification.is_read.is_(False))

        total = await self._session.scalar(select(func.count()).select_from(base.subquery()))
        stmt = base.order_by(Notification.created_at.desc()).limit(limit).offset(offset)
        items = list(await self._session.scalars(stmt))
        return items, int(total or 0)

    async def count_unread(self, organization_id: uuid.UUID, recipient_id: uuid.UUID) -> int:
        stmt = select(func.count()).where(
            Notification.organization_id == organization_id,
            Notification.recipient_id == recipient_id,
            Notification.deleted_at.is_(None),
            Notification.is_read.is_(False),
        )
        total = await self._session.scalar(stmt)
        return int(total or 0)

    async def mark_read(self, notification: Notification) -> Notification:
        if not notification.is_read:
            notification.is_read = True
            notification.read_at = datetime.now(UTC)
            await self._session.flush()
        return notification

    async def add(self, notification: Notification) -> Notification:
        self._session.add(notification)
        await self._session.flush()
        return notification
