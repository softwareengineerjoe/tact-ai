"""Org-scoped, soft-delete-aware persistence for employees."""

import uuid

from sqlalchemy import delete, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.employee import (
    Employee,
    EmployeeAvailability,
    EmployeeSkill,
    Skill,
)


class EmployeeRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get(self, organization_id: uuid.UUID, employee_id: uuid.UUID) -> Employee | None:
        stmt = select(Employee).where(
            Employee.id == employee_id,
            Employee.organization_id == organization_id,
            Employee.deleted_at.is_(None),
        )
        result: Employee | None = await self._session.scalar(stmt)
        return result

    async def list_page(
        self,
        organization_id: uuid.UUID,
        *,
        limit: int,
        offset: int,
        search: str | None = None,
        department: str | None = None,
        employment_status: str | None = None,
    ) -> tuple[list[Employee], int]:
        conditions = [
            Employee.organization_id == organization_id,
            Employee.deleted_at.is_(None),
        ]
        if search:
            like = f"%{search}%"
            conditions.append(
                or_(
                    Employee.display_name.ilike(like),
                    Employee.email.ilike(like),
                    Employee.employee_code.ilike(like),
                )
            )
        if department:
            conditions.append(Employee.department == department)
        if employment_status:
            conditions.append(Employee.employment_status == employment_status)

        total = await self._session.scalar(
            select(func.count()).select_from(Employee).where(*conditions)
        )
        stmt = (
            select(Employee)
            .where(*conditions)
            .order_by(Employee.display_name.asc())
            .limit(limit)
            .offset(offset)
        )
        items = list(await self._session.scalars(stmt))
        return items, total or 0

    async def add(self, employee: Employee) -> Employee:
        self._session.add(employee)
        await self._session.flush()
        return employee

    async def list_with_skills(self, organization_id: uuid.UUID) -> list[Employee]:
        """All non-deleted employees with skills eager-loaded (recommendations)."""
        stmt = (
            select(Employee)
            .where(
                Employee.organization_id == organization_id,
                Employee.deleted_at.is_(None),
            )
            .options(
                selectinload(Employee.skills).selectinload(EmployeeSkill.skill),
                selectinload(Employee.supervisor),
            )
            .order_by(Employee.display_name.asc())
        )
        return list(await self._session.scalars(stmt))

    # --- Skills (MASTER FR-004) ---

    async def list_skills(
        self, organization_id: uuid.UUID, employee_id: uuid.UUID
    ) -> list[EmployeeSkill]:
        stmt = (
            select(EmployeeSkill)
            .where(
                EmployeeSkill.organization_id == organization_id,
                EmployeeSkill.employee_id == employee_id,
                EmployeeSkill.deleted_at.is_(None),
            )
            .options(selectinload(EmployeeSkill.skill))
            .order_by(EmployeeSkill.created_at.asc())
        )
        return list(await self._session.scalars(stmt))

    async def ensure_skill(
        self, organization_id: uuid.UUID, name: str, category: str | None
    ) -> Skill:
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

    async def replace_skills(
        self,
        organization_id: uuid.UUID,
        employee_id: uuid.UUID,
        skills: list[EmployeeSkill],
    ) -> list[EmployeeSkill]:
        await self._session.execute(
            delete(EmployeeSkill).where(
                EmployeeSkill.organization_id == organization_id,
                EmployeeSkill.employee_id == employee_id,
            )
        )
        for skill in skills:
            self._session.add(skill)
        await self._session.flush()
        return skills

    # --- Availability (MASTER FR-006) ---

    async def list_availability(
        self, organization_id: uuid.UUID, employee_id: uuid.UUID
    ) -> list[EmployeeAvailability]:
        stmt = (
            select(EmployeeAvailability)
            .where(
                EmployeeAvailability.organization_id == organization_id,
                EmployeeAvailability.employee_id == employee_id,
                EmployeeAvailability.deleted_at.is_(None),
            )
            .order_by(EmployeeAvailability.period_start.asc())
        )
        return list(await self._session.scalars(stmt))

    async def replace_availability(
        self,
        organization_id: uuid.UUID,
        employee_id: uuid.UUID,
        periods: list[EmployeeAvailability],
    ) -> list[EmployeeAvailability]:
        await self._session.execute(
            delete(EmployeeAvailability).where(
                EmployeeAvailability.organization_id == organization_id,
                EmployeeAvailability.employee_id == employee_id,
            )
        )
        for period in periods:
            self._session.add(period)
        await self._session.flush()
        return periods
