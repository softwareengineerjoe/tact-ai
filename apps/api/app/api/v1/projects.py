"""Project endpoints (MASTER 22)."""

import uuid

from fastapi import APIRouter, Depends, Query, status

from app.api.deps import (
    get_principal,
    get_project_service,
    page_params,
    require_permission,
)
from app.schemas.common import Page, PageParams
from app.schemas.project import (
    ProjectCreate,
    ProjectRead,
    ProjectRoleRequirementCreate,
    ProjectRoleRequirementRead,
    ProjectUpdate,
)
from app.security.permissions import Permission
from app.security.principal import Principal
from app.services.project_service import ProjectService

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=Page[ProjectRead])
async def list_projects(
    principal: Principal = Depends(get_principal),
    service: ProjectService = Depends(get_project_service),
    params: PageParams = Depends(page_params),
    status_filter: str | None = Query(default=None, alias="status"),
    search: str | None = Query(default=None),
) -> Page[ProjectRead]:
    items, total = await service.list_projects(
        principal, params, status=status_filter, search=search
    )
    return Page(
        items=[ProjectRead.model_validate(p) for p in items],
        total=total,
        page=params.page,
        page_size=params.page_size,
    )


@router.post(
    "",
    response_model=ProjectRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_project(
    payload: ProjectCreate,
    principal: Principal = Depends(require_permission(Permission.PROJECTS_CREATE)),
    service: ProjectService = Depends(get_project_service),
) -> ProjectRead:
    project = await service.create_project(principal, payload)
    return ProjectRead.model_validate(project)


@router.get("/{project_id}", response_model=ProjectRead)
async def get_project(
    project_id: uuid.UUID,
    principal: Principal = Depends(get_principal),
    service: ProjectService = Depends(get_project_service),
) -> ProjectRead:
    project = await service.get_project(principal, project_id)
    return ProjectRead.model_validate(project)


@router.patch("/{project_id}", response_model=ProjectRead)
async def update_project(
    project_id: uuid.UUID,
    payload: ProjectUpdate,
    principal: Principal = Depends(require_permission(Permission.PROJECTS_EDIT)),
    service: ProjectService = Depends(get_project_service),
) -> ProjectRead:
    project = await service.update_project(principal, project_id, payload)
    return ProjectRead.model_validate(project)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: uuid.UUID,
    principal: Principal = Depends(require_permission(Permission.PROJECTS_ARCHIVE)),
    service: ProjectService = Depends(get_project_service),
) -> None:
    await service.delete_project(principal, project_id)


@router.get(
    "/{project_id}/requirements",
    response_model=list[ProjectRoleRequirementRead],
)
async def list_project_requirements(
    project_id: uuid.UUID,
    principal: Principal = Depends(get_principal),
    service: ProjectService = Depends(get_project_service),
) -> list[ProjectRoleRequirementRead]:
    items = await service.list_requirements(principal, project_id)
    return [ProjectRoleRequirementRead.from_model(r) for r in items]


@router.post(
    "/{project_id}/requirements",
    response_model=ProjectRoleRequirementRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_project_requirement(
    project_id: uuid.UUID,
    payload: ProjectRoleRequirementCreate,
    principal: Principal = Depends(require_permission(Permission.PROJECTS_EDIT)),
    service: ProjectService = Depends(get_project_service),
) -> ProjectRoleRequirementRead:
    requirement = await service.add_requirement(principal, project_id, payload)
    return ProjectRoleRequirementRead.from_model(requirement)
