"""Employee directory business rules and authorization (MASTER FR-004)."""

import uuid

from app.core.exceptions import ConflictError, NotFound
from app.models.employee import (
    Employee,
    EmployeeAvailability,
    EmployeeSkill,
)
from app.repositories.employee_repository import EmployeeRepository
from app.schemas.common import PageParams
from app.schemas.employee import (
    EmployeeAvailabilityPut,
    EmployeeCreate,
    EmployeeSkillsPut,
    EmployeeUpdate,
)
from app.security.permissions import Permission
from app.security.principal import Principal


class EmployeeService:
    def __init__(self, repository: EmployeeRepository) -> None:
        self._repository = repository

    async def list_employees(
        self,
        principal: Principal,
        params: PageParams,
        *,
        search: str | None = None,
        department: str | None = None,
        employment_status: str | None = None,
    ) -> tuple[list[Employee], int]:
        principal.require(Permission.PEOPLE_VIEW)
        return await self._repository.list_page(
            principal.organization_id,
            limit=params.page_size,
            offset=params.offset,
            search=search,
            department=department,
            employment_status=employment_status,
        )

    async def get_employee(self, principal: Principal, employee_id: uuid.UUID) -> Employee:
        principal.require(Permission.PEOPLE_VIEW)
        employee = await self._repository.get(principal.organization_id, employee_id)
        if employee is None:
            raise NotFound("Employee not found")
        return employee

    async def create_employee(self, principal: Principal, data: EmployeeCreate) -> Employee:
        principal.require(Permission.PEOPLE_EDIT)
        employee = Employee(
            organization_id=principal.organization_id,
            employee_code=data.employee_code,
            display_name=data.display_name,
            email=data.email,
            job_title=data.job_title,
            department=data.department,
            primary_role=data.primary_role,
            time_zone=data.time_zone,
            employment_status=data.employment_status,
        )
        return await self._repository.add(employee)

    async def update_employee(
        self, principal: Principal, employee_id: uuid.UUID, data: EmployeeUpdate
    ) -> Employee:
        principal.require(Permission.PEOPLE_EDIT)
        employee = await self._repository.get(principal.organization_id, employee_id)
        if employee is None:
            raise NotFound("Employee not found")
        if employee.version != data.version:
            raise ConflictError("Employee was modified by someone else")

        updates = data.model_dump(exclude_unset=True, exclude={"version"})
        for field, value in updates.items():
            setattr(employee, field, value)
        employee.version += 1
        return employee

    # --- Skills (MASTER FR-004) ---

    async def list_skills(
        self, principal: Principal, employee_id: uuid.UUID
    ) -> list[EmployeeSkill]:
        principal.require(Permission.PEOPLE_VIEW)
        await self._require_employee(principal, employee_id)
        return await self._repository.list_skills(principal.organization_id, employee_id)

    async def set_skills(
        self, principal: Principal, employee_id: uuid.UUID, data: EmployeeSkillsPut
    ) -> list[EmployeeSkill]:
        principal.require(Permission.PEOPLE_SKILLS_MANAGE)
        await self._require_employee(principal, employee_id)

        rows: list[EmployeeSkill] = []
        for item in data.skills:
            skill = await self._repository.ensure_skill(
                principal.organization_id, item.skill_name, item.category
            )
            rows.append(
                EmployeeSkill(
                    organization_id=principal.organization_id,
                    employee_id=employee_id,
                    skill_id=skill.id,
                    skill=skill,
                    proficiency_level=item.proficiency_level,
                    years_of_experience=item.years_of_experience,
                )
            )
        return await self._repository.replace_skills(principal.organization_id, employee_id, rows)

    # --- Availability (MASTER FR-006) ---

    async def list_availability(
        self, principal: Principal, employee_id: uuid.UUID
    ) -> list[EmployeeAvailability]:
        principal.require(Permission.PEOPLE_AVAILABILITY_VIEW)
        await self._require_employee(principal, employee_id)
        return await self._repository.list_availability(principal.organization_id, employee_id)

    async def set_availability(
        self, principal: Principal, employee_id: uuid.UUID, data: EmployeeAvailabilityPut
    ) -> list[EmployeeAvailability]:
        principal.require(Permission.PEOPLE_AVAILABILITY_MANAGE)
        await self._require_employee(principal, employee_id)

        rows = [
            EmployeeAvailability(
                organization_id=principal.organization_id,
                employee_id=employee_id,
                period_start=item.period_start,
                period_end=item.period_end,
                status=item.status,
                base_capacity_percent=item.base_capacity_percent,
                note=item.note,
                data_source=item.data_source,
            )
            for item in data.periods
        ]
        return await self._repository.replace_availability(
            principal.organization_id, employee_id, rows
        )

    async def _require_employee(self, principal: Principal, employee_id: uuid.UUID) -> Employee:
        employee = await self._repository.get(principal.organization_id, employee_id)
        if employee is None:
            raise NotFound("Employee not found")
        return employee
