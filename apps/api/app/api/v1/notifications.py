"""Notification endpoints (MASTER FR-018, section 22).

In-app notifications for the current user. Every route is scoped to the acting
recipient by the service layer.
"""

import uuid

from fastapi import APIRouter, Depends, Query

from app.api.deps import get_notification_service, get_principal, page_params
from app.schemas.common import PageParams
from app.schemas.notification import NotificationList, NotificationRead
from app.security.principal import Principal
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=NotificationList)
async def list_notifications(
    principal: Principal = Depends(get_principal),
    service: NotificationService = Depends(get_notification_service),
    params: PageParams = Depends(page_params),
    unread_only: bool = Query(False),
) -> NotificationList:
    return await service.list_notifications(principal, params, unread_only=unread_only)


@router.post("/{notification_id}/read", response_model=NotificationRead)
async def mark_notification_read(
    notification_id: uuid.UUID,
    principal: Principal = Depends(get_principal),
    service: NotificationService = Depends(get_notification_service),
) -> NotificationRead:
    return await service.mark_read(principal, notification_id)
