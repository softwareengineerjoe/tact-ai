"""Org-scoped, soft-delete-aware persistence for tickets (MASTER 21)."""

import uuid
from datetime import UTC, datetime

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.sql.elements import ColumnElement

from app.core.enums import TicketStatus
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

    async def list_for_employee(
        self, organization_id: uuid.UUID, employee_id: uuid.UUID
    ) -> list[Ticket]:
        """Tickets where the employee is the assignee or the reviewer.

        Used by the team-member dashboard (MASTER FR-016). Org-scoped and
        soft-delete-aware.
        """
        stmt = (
            select(Ticket)
            .where(
                Ticket.organization_id == organization_id,
                Ticket.deleted_at.is_(None),
                or_(
                    Ticket.assignee_id == employee_id,
                    Ticket.reviewer_id == employee_id,
                ),
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

    async def dashboard_counts(
        self, organization_id: uuid.UUID, *, now: datetime
    ) -> dict[str, int]:
        """Ticket counts for the manager dashboard (MASTER FR-015).

        open = not done/cancelled; overdue = past due and still open.
        """
        closed = (TicketStatus.DONE, TicketStatus.CANCELLED)
        base = [
            Ticket.organization_id == organization_id,
            Ticket.deleted_at.is_(None),
        ]

        async def _count(*conditions: ColumnElement[bool]) -> int:
            value = await self._session.scalar(
                select(func.count()).select_from(Ticket).where(*base, *conditions)
            )
            return value or 0

        return {
            "open": await _count(Ticket.status.notin_(closed)),
            "blocked": await _count(Ticket.status == TicketStatus.BLOCKED),
            "in_review": await _count(Ticket.status == TicketStatus.IN_REVIEW),
            "overdue": await _count(
                Ticket.status.notin_(closed),
                Ticket.due_date.is_not(None),
                Ticket.due_date < now,
            ),
        }

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
