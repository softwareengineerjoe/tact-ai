"""Org-scoped, soft-delete-aware persistence for tickets (MASTER 21)."""

import uuid
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.ticket import Ticket, TicketActivity, TicketComment


class TicketRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get(self, organization_id: uuid.UUID, ticket_id: uuid.UUID) -> Ticket | None:
        stmt = (
            select(Ticket)
            .where(
                Ticket.id == ticket_id,
                Ticket.organization_id == organization_id,
                Ticket.deleted_at.is_(None),
            )
            .options(
                selectinload(Ticket.assignee),
                selectinload(Ticket.reviewer),
            )
        )
        result: Ticket | None = await self._session.scalar(stmt)
        return result

    async def get_with_detail(
        self, organization_id: uuid.UUID, ticket_id: uuid.UUID
    ) -> Ticket | None:
        stmt = (
            select(Ticket)
            .where(
                Ticket.id == ticket_id,
                Ticket.organization_id == organization_id,
                Ticket.deleted_at.is_(None),
            )
            .options(
                selectinload(Ticket.assignee),
                selectinload(Ticket.reviewer),
                selectinload(Ticket.comments),
                selectinload(Ticket.activity),
            )
        )
        result: Ticket | None = await self._session.scalar(stmt)
        return result

    async def list_for_project(
        self, organization_id: uuid.UUID, project_id: uuid.UUID
    ) -> list[Ticket]:
        stmt = (
            select(Ticket)
            .where(
                Ticket.organization_id == organization_id,
                Ticket.project_id == project_id,
                Ticket.deleted_at.is_(None),
            )
            .options(
                selectinload(Ticket.assignee),
                selectinload(Ticket.reviewer),
            )
            .order_by(Ticket.created_at.asc())
        )
        return list(await self._session.scalars(stmt))

    async def list_for_organization(
        self, organization_id: uuid.UUID, *, limit: int, offset: int
    ) -> tuple[list[Ticket], int]:
        base = select(Ticket).where(
            Ticket.organization_id == organization_id,
            Ticket.deleted_at.is_(None),
        )
        total = len(list(await self._session.scalars(base)))
        stmt = (
            base.options(
                selectinload(Ticket.assignee),
                selectinload(Ticket.reviewer),
            )
            .order_by(Ticket.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(await self._session.scalars(stmt)), total

    async def add(self, ticket: Ticket) -> Ticket:
        self._session.add(ticket)
        await self._session.flush()
        return ticket

    async def add_comment(self, comment: TicketComment) -> TicketComment:
        self._session.add(comment)
        await self._session.flush()
        return comment

    async def add_activity(self, activity: TicketActivity) -> TicketActivity:
        self._session.add(activity)
        await self._session.flush()
        return activity

    async def soft_delete(self, ticket: Ticket) -> None:
        ticket.deleted_at = datetime.now(UTC)
        ticket.version += 1
        await self._session.flush()
