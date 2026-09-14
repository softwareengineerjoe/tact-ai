"""Notification responses (MASTER FR-018)."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.core.enums import NotificationType


class NotificationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    type: NotificationType
    title: str
    body: str | None
    link: str | None
    is_read: bool
    read_at: datetime | None
    created_at: datetime


class NotificationList(BaseModel):
    items: list[NotificationRead]
    total: int
    page: int
    page_size: int
    unread_count: int
