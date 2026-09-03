"""Unit tests for Sprint 3: deterministic capacity, scoring, and assignments.

These use stub repositories so the rules run without a database (MASTER §32):
Unknown availability is never treated as available, protected data never affects
the score, and overallocation requires an explicit override.
"""

import uuid
from datetime import UTC, datetime

import pytest
from app.core.enums import (
    AssignmentStatus,
    AvailabilityStatus,
    EmploymentStatus,
    ProficiencyLevel,
)
from app.core.exceptions import PermissionDenied, ValidationError
from app.models.employee import Employee, EmployeeAvailability, EmployeeSkill, Skill
from app.models.project import (
    Project,
    ProjectAssignment,
    ProjectRoleRequirement,
    RoleRequirementSkill,
)
from app.schemas.team import AssignmentCreate
from app.security.permissions import Permission
from app.security.principal import Principal
from app.services.assignment_service import AssignmentService
from app.services.capacity_service import CapacityService
from app.services.recommendation_service import RecommendationService

ORG = uuid.UUID("00000000-0000-0000-0000-0000000000a1")
PERIOD_START = datetime(2026, 10, 1, tzinfo=UTC)
PERIOD_END = datetime(2026, 12, 31, tzinfo=UTC)


def _principal(*permissions: Permission) -> Principal:
    return Principal(
        user_id=uuid.uuid4(),
        organization_id=ORG,
        roles=frozenset(),
        permissions=frozenset(permissions),
    )


def _skill(name: str) -> Skill:
    return Skill(id=uuid.uuid4(), organization_id=ORG, name=name)


def _employee(
    *,
    skills: dict[str, ProficiencyLevel] | None = None,
    time_zone: str | None = "UTC",
    status: EmploymentStatus = EmploymentStatus.ACTIVE,
) -> Employee:
    emp = Employee(
        id=uuid.uuid4(),
        organization_id=ORG,
        employee_code="E1",
        display_name="Test Person",
        email="t@example.com",
        time_zone=time_zone,
        employment_status=status,
        primary_role="Backend Developer",
    )
    emp.skills = []
    for name, level in (skills or {}).items():
        es = EmployeeSkill(
            organization_id=ORG,
            employee_id=emp.id,
            skill_id=uuid.uuid4(),
            proficiency_level=level,
        )
        es.skill = _skill(name)
        emp.skills.append(es)
    return emp


def _availability(base: int) -> EmployeeAvailability:
    rec = EmployeeAvailability(
        organization_id=ORG,
        employee_id=uuid.uuid4(),
        period_start=PERIOD_START,
        period_end=PERIOD_END,
        status=AvailabilityStatus.AVAILABLE,
        base_capacity_percent=base,
    )
    rec.updated_at = datetime(2026, 9, 1, tzinfo=UTC)
    return rec


def _requirement(required: list[str], preferred: list[str]) -> ProjectRoleRequirement:
    req = ProjectRoleRequirement(
        id=uuid.uuid4(),
        organization_id=ORG,
        project_id=uuid.uuid4(),
        role_name="Backend Developer",
        headcount=1,
        allocation_percent=100,
    )
    req.required_skills = []
    for name in required:
        rs = RoleRequirementSkill(organization_id=ORG, is_preferred=False)
        rs.skill = _skill(name)
        req.required_skills.append(rs)
    for name in preferred:
        rs = RoleRequirementSkill(organization_id=ORG, is_preferred=True)
        rs.skill = _skill(name)
        req.required_skills.append(rs)
    return req


class StubEmployeeRepo:
    def __init__(
        self,
        employees: list[Employee],
        availability: dict[uuid.UUID, list[EmployeeAvailability]],
    ) -> None:
        self._employees = employees
        self._availability = availability

    async def list_with_skills(self, organization_id):  # type: ignore[no-untyped-def]
        return [e for e in self._employees if e.organization_id == organization_id]

    async def list_availability(self, organization_id, employee_id):  # type: ignore[no-untyped-def]
        return self._availability.get(employee_id, [])

    async def get(self, organization_id, employee_id):  # type: ignore[no-untyped-def]
        for e in self._employees:
            if e.id == employee_id and e.organization_id == organization_id:
                return e
        return None


class StubAssignmentRepo:
    def __init__(self, active: list[ProjectAssignment] | None = None) -> None:
        self._active = active or []
        self.added: list[ProjectAssignment] = []

    async def list_active_for_employee(  # type: ignore[no-untyped-def]
        self,
        organization_id,
        employee_id,
        *,
        period_start,
        period_end,
        exclude_assignment_id=None,
    ):
        return [
            a
            for a in self._active
            if a.employee_id == employee_id
            and (exclude_assignment_id is None or a.id != exclude_assignment_id)
        ]

    async def find_active_for_employee_role(  # type: ignore[no-untyped-def]
        self, organization_id, project_id, role_requirement_id, employee_id
    ):
        return None

    async def add(self, assignment):  # type: ignore[no-untyped-def]
        self.added.append(assignment)
        return assignment

    @staticmethod
    def is_confirmed(status: str) -> bool:
        return status in {AssignmentStatus.CONFIRMED, AssignmentStatus.ACTIVE}

    @staticmethod
    def is_tentative(status: str) -> bool:
        return status in {AssignmentStatus.RESERVED, AssignmentStatus.PENDING_APPROVAL}


class StubProjectRepo:
    def __init__(self, project: Project, requirement: ProjectRoleRequirement) -> None:
        self._project = project
        self._requirement = requirement

    async def get(self, organization_id, project_id):  # type: ignore[no-untyped-def]
        if self._project.organization_id != organization_id:
            return None
        return self._project

    async def get_requirement(self, organization_id, requirement_id):  # type: ignore[no-untyped-def]
        if self._requirement.organization_id != organization_id:
            return None
        return self._requirement


# --- Capacity -------------------------------------------------------------


@pytest.mark.asyncio
async def test_unknown_availability_is_not_available() -> None:
    emp = _employee(skills={"Python": ProficiencyLevel.EXPERT})
    service = CapacityService(
        StubEmployeeRepo([emp], {}),  # type: ignore[arg-type]
        StubAssignmentRepo(),  # type: ignore[arg-type]
    )
    capacity = await service.compute_for_employee(
        ORG, emp, period_start=PERIOD_START, period_end=PERIOD_END
    )
    assert capacity.status == AvailabilityStatus.UNKNOWN
    assert capacity.remaining_capacity_percent == 0


@pytest.mark.asyncio
async def test_confirmed_allocation_reduces_capacity() -> None:
    emp = _employee(skills={"Python": ProficiencyLevel.EXPERT})
    confirmed = ProjectAssignment(
        organization_id=ORG,
        project_id=uuid.uuid4(),
        role_requirement_id=uuid.uuid4(),
        employee_id=emp.id,
        status=AssignmentStatus.CONFIRMED,
        allocation_percent=50,
    )
    service = CapacityService(
        StubEmployeeRepo([emp], {emp.id: [_availability(100)]}),  # type: ignore[arg-type]
        StubAssignmentRepo([confirmed]),  # type: ignore[arg-type]
    )
    capacity = await service.compute_for_employee(
        ORG, emp, period_start=PERIOD_START, period_end=PERIOD_END
    )
    assert capacity.remaining_capacity_percent == 50
    assert capacity.status == AvailabilityStatus.PARTIALLY_AVAILABLE


# --- Deterministic scoring ------------------------------------------------


@pytest.mark.asyncio
async def test_project_fit_score_is_deterministic() -> None:
    emp = _employee(
        skills={
            "Python": ProficiencyLevel.EXPERT,
            "FastAPI": ProficiencyLevel.ADVANCED,
        }
    )
    requirement = _requirement(["Python", "FastAPI"], ["Docker"])
    project = Project(id=requirement.project_id, organization_id=ORG, name="Atlas")
    employees = StubEmployeeRepo([emp], {emp.id: [_availability(100)]})
    capacity = CapacityService(employees, StubAssignmentRepo())  # type: ignore[arg-type]
    service = RecommendationService(
        StubProjectRepo(project, requirement),  # type: ignore[arg-type]
        employees,  # type: ignore[arg-type]
        capacity,
    )

    candidates = await service.recommend_for_role(
        _principal(Permission.TEAM_RECOMMEND),
        project.id,
        requirement.id,
        period_start=PERIOD_START,
        period_end=PERIOD_END,
        limit=10,
    )

    assert len(candidates) == 1
    top = candidates[0]
    # 40*1 + 30*1 + 15*0.875 + 10*0 + 5*1 = 88.125 -> 88
    assert top.project_fit_score == 88
    assert set(top.matched_skills) == {"Python", "FastAPI"}
    assert top.missing_skills == []


@pytest.mark.asyncio
async def test_ineligible_when_no_capacity() -> None:
    emp = _employee(skills={"Python": ProficiencyLevel.EXPERT})
    requirement = _requirement(["Python"], [])
    project = Project(id=requirement.project_id, organization_id=ORG, name="Atlas")
    employees = StubEmployeeRepo([emp], {})  # no availability -> Unknown
    capacity = CapacityService(employees, StubAssignmentRepo())  # type: ignore[arg-type]
    service = RecommendationService(
        StubProjectRepo(project, requirement),  # type: ignore[arg-type]
        employees,  # type: ignore[arg-type]
        capacity,
    )
    candidates = await service.recommend_for_role(
        _principal(Permission.TEAM_RECOMMEND),
        project.id,
        requirement.id,
        period_start=PERIOD_START,
        period_end=PERIOD_END,
        limit=10,
    )
    assert candidates == []


# --- Assignment overallocation -------------------------------------------


def _assignment_service(
    active: list[ProjectAssignment], emp: Employee, requirement: ProjectRoleRequirement
) -> AssignmentService:
    project = Project(id=requirement.project_id, organization_id=ORG, name="Atlas")
    employees = StubEmployeeRepo([emp], {emp.id: [_availability(100)]})
    assignments = StubAssignmentRepo(active)
    capacity = CapacityService(employees, assignments)  # type: ignore[arg-type]
    return AssignmentService(
        StubProjectRepo(project, requirement),  # type: ignore[arg-type]
        employees,  # type: ignore[arg-type]
        assignments,  # type: ignore[arg-type]
        capacity,
    )


def _overalloc_payload(requirement, emp, reason=None):  # type: ignore[no-untyped-def]
    return AssignmentCreate(
        role_requirement_id=requirement.id,
        employee_id=emp.id,
        allocation_percent=100,
        start_date=PERIOD_START,
        end_date=PERIOD_END,
        override_reason=reason,
    )


@pytest.mark.asyncio
async def test_overallocation_requires_override_reason() -> None:
    emp = _employee(skills={"Python": ProficiencyLevel.EXPERT})
    requirement = _requirement(["Python"], [])
    confirmed = ProjectAssignment(
        organization_id=ORG,
        project_id=uuid.uuid4(),
        role_requirement_id=uuid.uuid4(),
        employee_id=emp.id,
        status=AssignmentStatus.CONFIRMED,
        allocation_percent=80,
    )
    service = _assignment_service([confirmed], emp, requirement)
    principal = _principal(Permission.TEAM_ASSIGN)
    with pytest.raises(ValidationError):
        await service.create_assignment(
            principal, requirement.project_id, _overalloc_payload(requirement, emp)
        )


@pytest.mark.asyncio
async def test_overallocation_requires_override_permission() -> None:
    emp = _employee(skills={"Python": ProficiencyLevel.EXPERT})
    requirement = _requirement(["Python"], [])
    confirmed = ProjectAssignment(
        organization_id=ORG,
        project_id=uuid.uuid4(),
        role_requirement_id=uuid.uuid4(),
        employee_id=emp.id,
        status=AssignmentStatus.CONFIRMED,
        allocation_percent=80,
    )
    service = _assignment_service([confirmed], emp, requirement)
    principal = _principal(Permission.TEAM_ASSIGN)  # no override permission
    with pytest.raises(PermissionDenied):
        await service.create_assignment(
            principal,
            requirement.project_id,
            _overalloc_payload(requirement, emp, reason="Critical launch"),
        )


@pytest.mark.asyncio
async def test_overallocation_allowed_with_permission_and_reason() -> None:
    emp = _employee(skills={"Python": ProficiencyLevel.EXPERT})
    requirement = _requirement(["Python"], [])
    confirmed = ProjectAssignment(
        organization_id=ORG,
        project_id=uuid.uuid4(),
        role_requirement_id=uuid.uuid4(),
        employee_id=emp.id,
        status=AssignmentStatus.CONFIRMED,
        allocation_percent=80,
    )
    service = _assignment_service([confirmed], emp, requirement)
    principal = _principal(Permission.TEAM_ASSIGN, Permission.TEAM_OVERRIDE_CAPACITY)
    result = await service.create_assignment(
        principal,
        requirement.project_id,
        _overalloc_payload(requirement, emp, reason="Critical launch"),
    )
    assert result.assignment.status == AssignmentStatus.CONFIRMED
    assert result.warnings  # overallocation warning present
