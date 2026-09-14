"""Notification service: list and read a recipient's in-app alerts (FR-018).

Notifications are inherently self-scoped: a caller only ever sees and mutates
their own notifications. There is no separate notifications permission in the
catalog (MASTER 11); the authorization boundary is the recipient identity, so
every query is scoped to ``principal.user_id`` and the caller's organization.
"""

import uuid

from app.core.exceptions import NotFound
from app.repositories.notification_repository import NotificationRepository
from app.schemas.common import PageParams
from app.schemas.notification import NotificationList, NotificationRead
from app.security.principal import Principal


class NotificationService:
    def __init__(self, repository: NotificationRepository) -> None:
        self._repository = repository

    async def list_notifications(
        self, principal: Principal, params: PageParams, *, unread_only: bool
    ) -> NotificationList:
        items, total = await self._repository.list_for_recipient(
            principal.organization_id,
            principal.user_id,
            unread_only=unread_only,
            limit=params.page_size,
            offset=params.offset,
        )
        unread_count = await self._repository.count_unread(
            principal.organization_id, principal.user_id
        )
        return NotificationList(
            items=[NotificationRead.model_validate(n) for n in items],
            total=total,
            page=params.page,
            page_size=params.page_size,
            unread_count=unread_count,
        )

    async def mark_read(self, principal: Principal, notification_id: uuid.UUID) -> NotificationRead:
        notification = await self._repository.get_for_recipient(
            principal.organization_id, principal.user_id, notification_id
        )
        if notification is None:
            raise NotFound("Notification not found")
        updated = await self._repository.mark_read(notification)
        return NotificationRead.model_validate(updated)
