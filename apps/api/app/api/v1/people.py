"""Employee directory endpoints (MASTER 22)."""

import uuid

from fastapi import APIRouter, Depends, Query, status

from app.api.deps import (
    get_employee_service,
    get_principal,
    page_params,
    require_permission,
)
from app.core.enums import ProficiencyLevel
from app.models.employee import EmployeeSkill
from app.schemas.common import Page, PageParams
from app.schemas.employee import (
    EmployeeAvailabilityPut,
    EmployeeAvailabilityRead,
    EmployeeCreate,
    EmployeeRead,
    EmployeeSkillRead,
    EmployeeSkillsPut,
    EmployeeUpdate,
)
from app.security.permissions import Permission
from app.security.principal import Principal
from app.services.employee_service import EmployeeService

router = APIRouter(prefix="/people", tags=["people"])


@router.get("", response_model=Page[EmployeeRead])
async def list_people(
    principal: Principal = Depends(get_principal),
    service: EmployeeService = Depends(get_employee_service),
    params: PageParams = Depends(page_params),
    search: str | None = Query(default=None),
    department: str | None = Query(default=None),
    employment_status: str | None = Query(default=None),
) -> Page[EmployeeRead]:
    items, total = await service.list_employees(
        principal,
        params,
        search=search,
        department=department,
        employment_status=employment_status,
    )
    return Page(
        items=[EmployeeRead.model_validate(e) for e in items],
        total=total,
        page=params.page,
        page_size=params.page_size,
    )


@router.post(
    "",
    response_model=EmployeeRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_person(
    payload: EmployeeCreate,
    principal: Principal = Depends(require_permission(Permission.PEOPLE_EDIT)),
    service: EmployeeService = Depends(get_employee_service),
) -> EmployeeRead:
    employee = await service.create_employee(principal, payload)
    return EmployeeRead.model_validate(employee)


@router.get("/{employee_id}", response_model=EmployeeRead)
async def get_person(
    employee_id: uuid.UUID,
    principal: Principal = Depends(get_principal),
    service: EmployeeService = Depends(get_employee_service),
) -> EmployeeRead:
    employee = await service.get_employee(principal, employee_id)
    return EmployeeRead.model_validate(employee)


@router.patch("/{employee_id}", response_model=EmployeeRead)
async def update_person(
    employee_id: uuid.UUID,
    payload: EmployeeUpdate,
    principal: Principal = Depends(require_permission(Permission.PEOPLE_EDIT)),
    service: EmployeeService = Depends(get_employee_service),
) -> EmployeeRead:
    employee = await service.update_employee(principal, employee_id, payload)
    return EmployeeRead.model_validate(employee)


def _to_skill_read(skill: EmployeeSkill) -> EmployeeSkillRead:
    return EmployeeSkillRead(
        id=skill.id,
        skill_id=skill.skill_id,
        skill_name=skill.skill.name,
        category=skill.skill.category,
        proficiency_level=ProficiencyLevel(skill.proficiency_level),
        years_of_experience=skill.years_of_experience,
    )


@router.get("/{employee_id}/skills", response_model=list[EmployeeSkillRead])
async def list_person_skills(
    employee_id: uuid.UUID,
    principal: Principal = Depends(get_principal),
    service: EmployeeService = Depends(get_employee_service),
) -> list[EmployeeSkillRead]:
    skills = await service.list_skills(principal, employee_id)
    return [_to_skill_read(s) for s in skills]


@router.put("/{employee_id}/skills", response_model=list[EmployeeSkillRead])
async def put_person_skills(
    employee_id: uuid.UUID,
    payload: EmployeeSkillsPut,
    principal: Principal = Depends(require_permission(Permission.PEOPLE_SKILLS_MANAGE)),
    service: EmployeeService = Depends(get_employee_service),
) -> list[EmployeeSkillRead]:
    skills = await service.set_skills(principal, employee_id, payload)
    return [_to_skill_read(s) for s in skills]


@router.get("/{employee_id}/availability", response_model=list[EmployeeAvailabilityRead])
async def list_person_availability(
    employee_id: uuid.UUID,
    principal: Principal = Depends(get_principal),
    service: EmployeeService = Depends(get_employee_service),
) -> list[EmployeeAvailabilityRead]:
    periods = await service.list_availability(principal, employee_id)
    return [EmployeeAvailabilityRead.model_validate(p) for p in periods]


@router.put("/{employee_id}/availability", response_model=list[EmployeeAvailabilityRead])
async def put_person_availability(
    employee_id: uuid.UUID,
    payload: EmployeeAvailabilityPut,
    principal: Principal = Depends(require_permission(Permission.PEOPLE_AVAILABILITY_MANAGE)),
    service: EmployeeService = Depends(get_employee_service),
) -> list[EmployeeAvailabilityRead]:
    periods = await service.set_availability(principal, employee_id, payload)
    return [EmployeeAvailabilityRead.model_validate(p) for p in periods]
