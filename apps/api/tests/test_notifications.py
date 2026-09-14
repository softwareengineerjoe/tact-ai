"""Unit tests for in-app notifications (MASTER FR-018).

Notifications are self-scoped to the recipient. Stub repositories exercise
recipient scoping, unread counting, mark-read idempotency, and not-found without
a database.
"""

import uuid
from datetime import UTC, datetime

import pytest
from app.core.enums import NotificationType
from app.core.exceptions import NotFound
from app.models.notification import Notification
from app.schemas.common import PageParams
from app.security.principal import Principal
from app.services.notification_service import NotificationService

ORG = uuid.UUID("00000000-0000-0000-0000-0000000000d1")
USER = uuid.UUID("00000000-0000-0000-0000-0000000000d2")


def _principal() -> Principal:
    return Principal(
        user_id=USER,
        organization_id=ORG,
        roles=frozenset(),
        permissions=frozenset(),
    )


def _notification(*, is_read: bool = False) -> Notification:
    n = Notification(
        organization_id=ORG,
        recipient_id=USER,
        type=NotificationType.TICKET_BLOCKED,
        title="A ticket is blocked",
        body="Details",
        link="/tickets",
        is_read=is_read,
    )
    n.id = uuid.uuid4()
    n.created_at = datetime.now(UTC)
    n.read_at = datetime.now(UTC) if is_read else None
    return n


class StubNotificationRepo:
    def __init__(self, items: list[Notification]) -> None:
        self._items = items

    async def list_for_recipient(  # type: ignore[no-untyped-def]
        self, organization_id, recipient_id, *, unread_only, limit, offset
    ):
        scoped = [
            n
            for n in self._items
            if n.organization_id == organization_id and n.recipient_id == recipient_id
        ]
        if unread_only:
            scoped = [n for n in scoped if not n.is_read]
        return scoped[offset : offset + limit], len(scoped)

    async def count_unread(self, organization_id, recipient_id):  # type: ignore[no-untyped-def]
        return sum(
            1
            for n in self._items
            if n.organization_id == organization_id
            and n.recipient_id == recipient_id
            and not n.is_read
        )

    async def get_for_recipient(  # type: ignore[no-untyped-def]
        self, organization_id, recipient_id, notification_id
    ):
        for n in self._items:
            if (
                n.id == notification_id
                and n.organization_id == organization_id
                and n.recipient_id == recipient_id
            ):
                return n
        return None

    async def mark_read(self, notification):  # type: ignore[no-untyped-def]
        if not notification.is_read:
            notification.is_read = True
            notification.read_at = datetime.now(UTC)
        return notification


PARAMS = PageParams(page=1, page_size=20)


@pytest.mark.asyncio
async def test_list_returns_recipient_items_with_unread_count() -> None:
    items = [_notification(), _notification(is_read=True)]
    service = NotificationService(StubNotificationRepo(items))  # type: ignore[arg-type]

    result = await service.list_notifications(_principal(), PARAMS, unread_only=False)

    assert result.total == 2
    assert result.unread_count == 1


@pytest.mark.asyncio
async def test_list_unread_only_filters_read() -> None:
    items = [_notification(), _notification(is_read=True)]
    service = NotificationService(StubNotificationRepo(items))  # type: ignore[arg-type]

    result = await service.list_notifications(_principal(), PARAMS, unread_only=True)

    assert result.total == 1
    assert all(not n.is_read for n in result.items)


@pytest.mark.asyncio
async def test_list_excludes_other_recipients() -> None:
    mine = _notification()
    theirs = _notification()
    theirs.recipient_id = uuid.uuid4()
    service = NotificationService(StubNotificationRepo([mine, theirs]))  # type: ignore[arg-type]

    result = await service.list_notifications(_principal(), PARAMS, unread_only=False)

    assert result.total == 1


@pytest.mark.asyncio
async def test_mark_read_sets_flag() -> None:
    item = _notification()
    service = NotificationService(StubNotificationRepo([item]))  # type: ignore[arg-type]

    result = await service.mark_read(_principal(), item.id)

    assert result.is_read is True
    assert result.read_at is not None


@pytest.mark.asyncio
async def test_mark_read_unknown_raises_not_found() -> None:
    service = NotificationService(StubNotificationRepo([]))  # type: ignore[arg-type]

    with pytest.raises(NotFound):
        await service.mark_read(_principal(), uuid.uuid4())
