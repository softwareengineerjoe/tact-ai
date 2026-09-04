"""Org-scoped persistence for the general audit log (MASTER 28)."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit import AuditLog


class AuditRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def record(
        self,
        *,
        organization_id: uuid.UUID,
        actor_id: uuid.UUID,
        action: str,
        resource_type: str,
        resource_id: uuid.UUID | None = None,
        detail: str | None = None,
    ) -> None:
        self._session.add(
            AuditLog(
                organization_id=organization_id,
                actor_id=actor_id,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                detail=detail,
            )
        )
        await self._session.flush()

    async def list_for_resource(
        self, organization_id: uuid.UUID, resource_type: str, resource_id: uuid.UUID
    ) -> list[AuditLog]:
        stmt = (
            select(AuditLog)
            .where(
                AuditLog.organization_id == organization_id,
                AuditLog.resource_type == resource_type,
                AuditLog.resource_id == resource_id,
            )
            .order_by(AuditLog.created_at.desc())
        )
        return list(await self._session.scalars(stmt))
