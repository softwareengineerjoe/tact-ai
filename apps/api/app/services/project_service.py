"""Project business rules and authorization (MASTER FR-002)."""

import uuid

from app.core.exceptions import ConflictError, NotFound
from app.models.project import (
    Project,
    ProjectRoleRequirement,
    RoleRequirementSkill,
)
from app.repositories.project_repository import ProjectRepository
from app.schemas.common import PageParams
from app.schemas.project import (
    ProjectCreate,
    ProjectRoleRequirementCreate,
    ProjectRoleRequirementUpdate,
    ProjectUpdate,
)
from app.security.permissions import Permission
from app.security.principal import Principal


class ProjectService:
    def __init__(self, repository: ProjectRepository) -> None:
        self._repository = repository

    async def list_projects(
        self,
        principal: Principal,
        params: PageParams,
        *,
        status: str | None = None,
        search: str | None = None,
    ) -> tuple[list[Project], int]:
        principal.require(Permission.PROJECTS_VIEW)
        return await self._repository.list_page(
            principal.organization_id,
            limit=params.page_size,
            offset=params.offset,
            status=status,
            search=search,
        )

    async def get_project(self, principal: Principal, project_id: uuid.UUID) -> Project:
        principal.require(Permission.PROJECTS_VIEW)
        project = await self._repository.get(principal.organization_id, project_id)
        if project is None:
            raise NotFound("Project not found")
        return project

    async def create_project(self, principal: Principal, data: ProjectCreate) -> Project:
        principal.require(Permission.PROJECTS_CREATE)
        project = Project(
            organization_id=principal.organization_id,
            name=data.name,
            description=data.description,
            business_objective=data.business_objective,
            priority=data.priority,
            manager_id=data.manager_id,
            start_date=data.start_date,
            target_end_date=data.target_end_date,
            ticket_provider=data.ticket_provider,
            expected_team_size=data.expected_team_size,
        )
        return await self._repository.add(project)

    async def update_project(
        self, principal: Principal, project_id: uuid.UUID, data: ProjectUpdate
    ) -> Project:
        principal.require(Permission.PROJECTS_EDIT)
        project = await self._repository.get(principal.organization_id, project_id)
        if project is None:
            raise NotFound("Project not found")
        if project.version != data.version:
            raise ConflictError("Project was modified by someone else")

        updates = data.model_dump(exclude_unset=True, exclude={"version"})
        for field, value in updates.items():
            setattr(project, field, value)
        project.version += 1
        return project

    # --- Role requirements (MASTER FR-003) ---

    async def list_requirements(
        self, principal: Principal, project_id: uuid.UUID
    ) -> list[ProjectRoleRequirement]:
        principal.require(Permission.PROJECTS_VIEW)
        await self._require_project(principal, project_id)
        return await self._repository.list_requirements(principal.organization_id, project_id)

    async def add_requirement(
        self,
        principal: Principal,
        project_id: uuid.UUID,
        data: ProjectRoleRequirementCreate,
    ) -> ProjectRoleRequirement:
        principal.require(Permission.PROJECTS_EDIT)
        await self._require_project(principal, project_id)
        requirement = ProjectRoleRequirement(
            organization_id=principal.organization_id,
            project_id=project_id,
            role_name=data.role_name,
            headcount=data.headcount,
            allocation_percent=data.allocation_percent,
            description=data.description,
        )
        for skill_name in data.required_skills:
            skill = await self._repository.ensure_skill(principal.organization_id, skill_name)
            requirement.required_skills.append(
                RoleRequirementSkill(
                    organization_id=principal.organization_id,
                    skill_id=skill.id,
                    skill=skill,
                    is_preferred=False,
                )
            )
        for skill_name in data.preferred_skills:
            skill = await self._repository.ensure_skill(principal.organization_id, skill_name)
            requirement.required_skills.append(
                RoleRequirementSkill(
                    organization_id=principal.organization_id,
                    skill_id=skill.id,
                    skill=skill,
                    is_preferred=True,
                )
            )
        return await self._repository.add_requirement(requirement)

    async def update_requirement(
        self,
        principal: Principal,
        requirement_id: uuid.UUID,
        data: ProjectRoleRequirementUpdate,
    ) -> ProjectRoleRequirement:
        principal.require(Permission.PROJECTS_EDIT)
        requirement = await self._repository.get_requirement(
            principal.organization_id, requirement_id
        )
        if requirement is None:
            raise NotFound("Project role requirement not found")
        if requirement.version != data.version:
            raise ConflictError("Requirement was modified by someone else")

        updates = data.model_dump(
            exclude_unset=True,
            exclude={"version", "required_skills", "preferred_skills"},
        )
        for field, value in updates.items():
            setattr(requirement, field, value)

        # Replace skills only when the caller supplied them.
        if data.required_skills is not None or data.preferred_skills is not None:
            requirement.required_skills.clear()
            for skill_name in data.required_skills or []:
                skill = await self._repository.ensure_skill(principal.organization_id, skill_name)
                requirement.required_skills.append(
                    RoleRequirementSkill(
                        organization_id=principal.organization_id,
                        skill_id=skill.id,
                        skill=skill,
                        is_preferred=False,
                    )
                )
            for skill_name in data.preferred_skills or []:
                skill = await self._repository.ensure_skill(principal.organization_id, skill_name)
                requirement.required_skills.append(
                    RoleRequirementSkill(
                        organization_id=principal.organization_id,
                        skill_id=skill.id,
                        skill=skill,
                        is_preferred=True,
                    )
                )

        requirement.version += 1
        return requirement

    async def delete_requirement(self, principal: Principal, requirement_id: uuid.UUID) -> None:
        principal.require(Permission.PROJECTS_EDIT)
        requirement = await self._repository.get_requirement(
            principal.organization_id, requirement_id
        )
        if requirement is None:
            raise NotFound("Project role requirement not found")
        await self._repository.soft_delete_requirement(requirement)

    async def _require_project(self, principal: Principal, project_id: uuid.UUID) -> Project:
        project = await self._repository.get(principal.organization_id, project_id)
        if project is None:
            raise NotFound("Project not found")
        return project
