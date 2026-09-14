"""Org-scoped persistence for import jobs and their row results (FR-019)."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.import_job import ImportJob, ImportRowResult


class ImportRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def add_job(self, job: ImportJob) -> ImportJob:
        self._session.add(job)
        await self._session.flush()
        return job

    async def add_row(self, row: ImportRowResult) -> ImportRowResult:
        self._session.add(row)
        await self._session.flush()
        return row

    async def get(self, organization_id: uuid.UUID, import_id: uuid.UUID) -> ImportJob | None:
        stmt = (
            select(ImportJob)
            .where(
                ImportJob.id == import_id,
                ImportJob.organization_id == organization_id,
                ImportJob.deleted_at.is_(None),
            )
            .options(selectinload(ImportJob.rows))
        )
        result: ImportJob | None = await self._session.scalar(stmt)
        return result
