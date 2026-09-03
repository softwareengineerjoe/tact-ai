"""Project role requirement endpoints not nested under a project (MASTER 22)."""

import uuid

from fastapi import APIRouter, Depends

from app.api.deps import get_project_service, require_permission
from app.schemas.project import (
    ProjectRoleRequirementRead,
    ProjectRoleRequirementUpdate,
)
from app.security.permissions import Permission
from app.security.principal import Principal
from app.services.project_service import ProjectService

router = APIRouter(prefix="/project-requirements", tags=["projects"])


@router.patch("/{requirement_id}", response_model=ProjectRoleRequirementRead)
async def update_project_requirement(
    requirement_id: uuid.UUID,
    payload: ProjectRoleRequirementUpdate,
    principal: Principal = Depends(require_permission(Permission.PROJECTS_EDIT)),
    service: ProjectService = Depends(get_project_service),
) -> ProjectRoleRequirementRead:
    requirement = await service.update_requirement(principal, requirement_id, payload)
    return ProjectRoleRequirementRead.model_validate(requirement)
