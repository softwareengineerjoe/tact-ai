"""Org-scoped, soft-delete-aware persistence for projects."""

import uuid
from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.employee import Skill
from app.models.project import (
    Project,
    ProjectRoleRequirement,
    RoleRequirementSkill,
)


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

    async def soft_delete(self, project: Project) -> None:
        """Soft-delete a project, preserving history (MASTER 21)."""
        project.deleted_at = datetime.now(UTC)
        project.version += 1
        await self._session.flush()

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
            .options(
                selectinload(ProjectRoleRequirement.required_skills).selectinload(
                    RoleRequirementSkill.skill
                )
            )
            .order_by(ProjectRoleRequirement.created_at.asc())
        )
        return list(await self._session.scalars(stmt))

    async def get_requirement(
        self, organization_id: uuid.UUID, requirement_id: uuid.UUID
    ) -> ProjectRoleRequirement | None:
        stmt = (
            select(ProjectRoleRequirement)
            .where(
                ProjectRoleRequirement.id == requirement_id,
                ProjectRoleRequirement.organization_id == organization_id,
                ProjectRoleRequirement.deleted_at.is_(None),
            )
            .options(
                selectinload(ProjectRoleRequirement.required_skills).selectinload(
                    RoleRequirementSkill.skill
                )
            )
        )
        result: ProjectRoleRequirement | None = await self._session.scalar(stmt)
        return result

    async def ensure_skill(
        self, organization_id: uuid.UUID, name: str, category: str | None = None
    ) -> Skill:
        """Return an existing skill by name (org-scoped) or create it."""
        stmt = select(Skill).where(
            Skill.organization_id == organization_id,
            Skill.name == name,
            Skill.deleted_at.is_(None),
        )
        skill = await self._session.scalar(stmt)
        if skill is None:
            skill = Skill(organization_id=organization_id, name=name, category=category)
            self._session.add(skill)
            await self._session.flush()
        return skill

    async def add_requirement(self, requirement: ProjectRoleRequirement) -> ProjectRoleRequirement:
        self._session.add(requirement)
        await self._session.flush()
        return requirement

    async def soft_delete_requirement(self, requirement: ProjectRoleRequirement) -> None:
        """Soft-delete a role requirement, preserving history (MASTER 21)."""
        requirement.deleted_at = datetime.now(UTC)
        requirement.version += 1
        await self._session.flush()
