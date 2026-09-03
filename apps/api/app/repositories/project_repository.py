"""Org-scoped, soft-delete-aware persistence for projects."""

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import Project, ProjectRoleRequirement


class ProjectRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get(self, organization_id: uuid.UUID, project_id: uuid.UUID) -> Project | None:
        stmt = select(Project).where(
            Project.id == project_id,
            Project.organization_id == organization_id,
            Project.deleted_at.is_(None),
        )
        result: Project | None = await self._session.scalar(stmt)
        return result

    async def list_page(
        self,
        organization_id: uuid.UUID,
        *,
        limit: int,
        offset: int,
        status: str | None = None,
        search: str | None = None,
    ) -> tuple[list[Project], int]:
        conditions = [
            Project.organization_id == organization_id,
            Project.deleted_at.is_(None),
        ]
        if status is not None:
            conditions.append(Project.status == status)
        if search:
            conditions.append(Project.name.ilike(f"%{search}%"))

        total = await self._session.scalar(
            select(func.count()).select_from(Project).where(*conditions)
        )
        stmt = (
            select(Project)
            .where(*conditions)
            .order_by(Project.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        items = list(await self._session.scalars(stmt))
        return items, total or 0

    async def add(self, project: Project) -> Project:
        self._session.add(project)
        await self._session.flush()
        return project

    # --- Role requirements (MASTER FR-003) ---

    async def list_requirements(
        self, organization_id: uuid.UUID, project_id: uuid.UUID
    ) -> list[ProjectRoleRequirement]:
        stmt = (
            select(ProjectRoleRequirement)
            .where(
                ProjectRoleRequirement.organization_id == organization_id,
                ProjectRoleRequirement.project_id == project_id,
                ProjectRoleRequirement.deleted_at.is_(None),
            )
            .order_by(ProjectRoleRequirement.created_at.asc())
        )
        return list(await self._session.scalars(stmt))

    async def get_requirement(
        self, organization_id: uuid.UUID, requirement_id: uuid.UUID
    ) -> ProjectRoleRequirement | None:
        stmt = select(ProjectRoleRequirement).where(
            ProjectRoleRequirement.id == requirement_id,
            ProjectRoleRequirement.organization_id == organization_id,
            ProjectRoleRequirement.deleted_at.is_(None),
        )
        result: ProjectRoleRequirement | None = await self._session.scalar(stmt)
        return result

    async def add_requirement(self, requirement: ProjectRoleRequirement) -> ProjectRoleRequirement:
        self._session.add(requirement)
        await self._session.flush()
        return requirement
