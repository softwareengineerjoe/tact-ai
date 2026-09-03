"""Shared FastAPI dependencies: principal, session, pagination, guards.

Local development uses a seeded demonstration principal (MASTER FR-001 allows a
simplified role selector for demo). Production will resolve the principal from a
validated Entra ID token — the interface below stays identical.
"""

import uuid
from collections.abc import Callable

from fastapi import Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_session
from app.repositories.assignment_repository import AssignmentRepository
from app.repositories.employee_repository import EmployeeRepository
from app.repositories.project_repository import ProjectRepository
from app.schemas.common import PageParams
from app.security.permissions import Permission
from app.security.principal import Principal
from app.services.assignment_service import AssignmentService
from app.services.capacity_service import CapacityService
from app.services.employee_service import EmployeeService
from app.services.project_service import ProjectService
from app.services.recommendation_service import RecommendationService

# Stable demo identifiers so seeded data lines up across restarts.
DEMO_ORGANIZATION_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")
DEMO_USER_ID = uuid.UUID("00000000-0000-0000-0000-000000000002")


async def get_principal() -> Principal:
    """Resolve the acting principal.

    MVP/local: a full-permission demo manager. Replace with Entra ID JWT
    validation in Phase 2 without changing the dependency signature.
    """
    return Principal(
        user_id=DEMO_USER_ID,
        organization_id=DEMO_ORGANIZATION_ID,
        roles=frozenset({"project_manager"}),
        permissions=frozenset(Permission),
    )


def require_permission(permission: Permission) -> Callable[[Principal], Principal]:
    """Coarse router-level guard (defense in depth). Services re-check."""

    def _dep(principal: Principal = Depends(get_principal)) -> Principal:
        principal.require(permission)
        return principal

    return _dep


def page_params(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
) -> PageParams:
    return PageParams(page=page, page_size=page_size)


def get_project_service(
    session: AsyncSession = Depends(get_session),
) -> ProjectService:
    return ProjectService(ProjectRepository(session))


def get_employee_service(
    session: AsyncSession = Depends(get_session),
) -> EmployeeService:
    return EmployeeService(EmployeeRepository(session))


def get_capacity_service(
    session: AsyncSession = Depends(get_session),
) -> CapacityService:
    return CapacityService(EmployeeRepository(session), AssignmentRepository(session))


def get_recommendation_service(
    session: AsyncSession = Depends(get_session),
) -> RecommendationService:
    employees = EmployeeRepository(session)
    capacity = CapacityService(employees, AssignmentRepository(session))
    return RecommendationService(ProjectRepository(session), employees, capacity)


def get_assignment_service(
    session: AsyncSession = Depends(get_session),
) -> AssignmentService:
    employees = EmployeeRepository(session)
    assignments = AssignmentRepository(session)
    capacity = CapacityService(employees, assignments)
    return AssignmentService(ProjectRepository(session), employees, assignments, capacity)
