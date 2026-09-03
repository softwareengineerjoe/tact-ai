"""Unit tests for project & employee services using stub repositories.

These cover authorization and concurrency rules without a database. DB-backed
integration tests run separately once PostgreSQL is available.
"""

import uuid
from datetime import datetime, timedelta

import pytest
from app.core.enums import AvailabilityStatus, ProficiencyLevel
from app.core.exceptions import ConflictError, NotFound, PermissionDenied
from app.models.employee import Employee, Skill
from app.models.project import Project, ProjectRoleRequirement
from app.schemas.common import PageParams
from app.schemas.employee import (
    EmployeeAvailabilityPut,
    EmployeeAvailabilityWrite,
    EmployeeSkillsPut,
    EmployeeSkillWrite,
    EmployeeUpdate,
)
from app.schemas.project import (
    ProjectCreate,
    ProjectRoleRequirementCreate,
    ProjectRoleRequirementUpdate,
    ProjectUpdate,
)
from app.security.permissions import Permission
from app.security.principal import Principal
from app.services.employee_service import EmployeeService
from app.services.project_service import ProjectService

ORG_A = uuid.UUID("00000000-0000-0000-0000-0000000000a1")
ORG_B = uuid.UUID("00000000-0000-0000-0000-0000000000b1")


def _principal(*permissions: Permission, org: uuid.UUID = ORG_A) -> Principal:
    return Principal(
        user_id=uuid.uuid4(),
        organization_id=org,
        roles=frozenset(),
        permissions=frozenset(permissions),
    )


class StubProjectRepo:
    def __init__(self, project: Project | None = None) -> None:
        self.project = project
        self.added: list[Project] = []
        self.requirement: object | None = None
        self.requirements: list[object] = []
        self.added_requirements: list[object] = []

    async def get(self, organization_id: uuid.UUID, project_id: uuid.UUID) -> Project | None:
        if self.project is None:
            return None
        if self.project.organization_id != organization_id:
            return None  # org isolation
        return self.project

    async def add(self, project: Project) -> Project:
        self.added.append(project)
        return project

    async def list_requirements(self, organization_id, project_id):  # type: ignore[no-untyped-def]
        return list(self.requirements)

    async def get_requirement(self, organization_id, requirement_id):  # type: ignore[no-untyped-def]
        req = self.requirement
        if req is None or req.organization_id != organization_id:
            return None
        return req

    async def add_requirement(self, requirement):  # type: ignore[no-untyped-def]
        self.added_requirements.append(requirement)
        return requirement


class StubEmployeeRepo:
    def __init__(self, employee: Employee | None = None) -> None:
        self.employee = employee
        self.replaced_skills: list[object] | None = None
        self.replaced_availability: list[object] | None = None

    async def get(self, organization_id: uuid.UUID, employee_id: uuid.UUID) -> Employee | None:
        if self.employee is None or self.employee.organization_id != organization_id:
            return None
        return self.employee

    async def ensure_skill(self, organization_id, name, category):  # type: ignore[no-untyped-def]
        return Skill(organization_id=organization_id, name=name, category=category)

    async def replace_skills(self, organization_id, employee_id, skills):  # type: ignore[no-untyped-def]
        self.replaced_skills = skills
        return skills

    async def list_skills(self, organization_id, employee_id):  # type: ignore[no-untyped-def]
        return []

    async def replace_availability(self, organization_id, employee_id, periods):  # type: ignore[no-untyped-def]
        self.replaced_availability = periods
        return periods

    async def list_availability(self, organization_id, employee_id):  # type: ignore[no-untyped-def]
        return []


@pytest.mark.asyncio
async def test_create_project_requires_permission() -> None:
    service = ProjectService(StubProjectRepo())  # type: ignore[arg-type]
    viewer = _principal(Permission.PROJECTS_VIEW)
    with pytest.raises(PermissionDenied):
        await service.create_project(viewer, ProjectCreate(name="X"))


@pytest.mark.asyncio
async def test_create_project_sets_org_from_principal() -> None:
    repo = StubProjectRepo()
    service = ProjectService(repo)  # type: ignore[arg-type]
    creator = _principal(Permission.PROJECTS_CREATE)
    project = await service.create_project(creator, ProjectCreate(name="Atlas"))
    assert project.organization_id == ORG_A
    assert repo.added == [project]


@pytest.mark.asyncio
async def test_get_project_enforces_org_isolation() -> None:
    other_org_project = Project(organization_id=ORG_B, name="Secret")
    service = ProjectService(StubProjectRepo(other_org_project))  # type: ignore[arg-type]
    principal = _principal(Permission.PROJECTS_VIEW, org=ORG_A)
    with pytest.raises(NotFound):
        await service.get_project(principal, uuid.uuid4())


@pytest.mark.asyncio
async def test_update_project_version_conflict() -> None:
    project = Project(organization_id=ORG_A, name="Atlas")
    project.version = 3
    service = ProjectService(StubProjectRepo(project))  # type: ignore[arg-type]
    editor = _principal(Permission.PROJECTS_EDIT)
    with pytest.raises(ConflictError):
        await service.update_project(editor, uuid.uuid4(), ProjectUpdate(name="New", version=1))


@pytest.mark.asyncio
async def test_update_project_increments_version() -> None:
    project = Project(organization_id=ORG_A, name="Atlas")
    project.version = 1
    service = ProjectService(StubProjectRepo(project))  # type: ignore[arg-type]
    editor = _principal(Permission.PROJECTS_EDIT)
    updated = await service.update_project(
        editor, uuid.uuid4(), ProjectUpdate(name="Atlas v2", version=1)
    )
    assert updated.name == "Atlas v2"
    assert updated.version == 2


@pytest.mark.asyncio
async def test_list_employees_requires_permission() -> None:
    service = EmployeeService(StubEmployeeRepo())  # type: ignore[arg-type]
    principal = _principal()  # no permissions
    with pytest.raises(PermissionDenied):
        await service.list_employees(principal, PageParams(page=1, page_size=20))


@pytest.mark.asyncio
async def test_update_employee_version_conflict() -> None:
    employee = Employee(
        organization_id=ORG_A,
        employee_code="EMP-1",
        display_name="A",
        email="a@example.com",
    )
    employee.version = 2
    service = EmployeeService(StubEmployeeRepo(employee))  # type: ignore[arg-type]
    editor = _principal(Permission.PEOPLE_EDIT)
    with pytest.raises(ConflictError):
        await service.update_employee(
            editor, uuid.uuid4(), EmployeeUpdate(display_name="B", version=0)
        )


@pytest.mark.asyncio
async def test_set_skills_requires_manage_permission() -> None:
    employee = Employee(
        organization_id=ORG_A,
        employee_code="EMP-1",
        display_name="A",
        email="a@example.com",
    )
    service = EmployeeService(StubEmployeeRepo(employee))  # type: ignore[arg-type]
    viewer = _principal(Permission.PEOPLE_VIEW)
    with pytest.raises(PermissionDenied):
        await service.set_skills(
            viewer,
            uuid.uuid4(),
            EmployeeSkillsPut(
                skills=[
                    EmployeeSkillWrite(
                        skill_name="Python", proficiency_level=ProficiencyLevel.EXPERT
                    )
                ]
            ),
        )


@pytest.mark.asyncio
async def test_set_skills_replaces_full_set() -> None:
    employee = Employee(
        organization_id=ORG_A,
        employee_code="EMP-1",
        display_name="A",
        email="a@example.com",
    )
    repo = StubEmployeeRepo(employee)
    service = EmployeeService(repo)  # type: ignore[arg-type]
    manager = _principal(Permission.PEOPLE_SKILLS_MANAGE)
    result = await service.set_skills(
        manager,
        uuid.uuid4(),
        EmployeeSkillsPut(
            skills=[
                EmployeeSkillWrite(skill_name="Python", proficiency_level=ProficiencyLevel.EXPERT),
                EmployeeSkillWrite(
                    skill_name="FastAPI", proficiency_level=ProficiencyLevel.ADVANCED
                ),
            ]
        ),
    )
    assert len(result) == 2
    assert repo.replaced_skills is result


@pytest.mark.asyncio
async def test_set_availability_requires_manage_permission() -> None:
    employee = Employee(
        organization_id=ORG_A,
        employee_code="EMP-1",
        display_name="A",
        email="a@example.com",
    )
    service = EmployeeService(StubEmployeeRepo(employee))  # type: ignore[arg-type]
    viewer = _principal(Permission.PEOPLE_AVAILABILITY_VIEW)
    with pytest.raises(PermissionDenied):
        await service.set_availability(
            viewer,
            uuid.uuid4(),
            EmployeeAvailabilityPut(
                periods=[
                    EmployeeAvailabilityWrite(
                        period_start=datetime(2026, 10, 1),
                        period_end=datetime(2026, 12, 31),
                        status=AvailabilityStatus.AVAILABLE,
                        base_capacity_percent=100,
                    )
                ]
            ),
        )


@pytest.mark.asyncio
async def test_set_availability_replaces_periods() -> None:
    employee = Employee(
        organization_id=ORG_A,
        employee_code="EMP-1",
        display_name="A",
        email="a@example.com",
    )
    repo = StubEmployeeRepo(employee)
    service = EmployeeService(repo)  # type: ignore[arg-type]
    manager = _principal(Permission.PEOPLE_AVAILABILITY_MANAGE)
    start = datetime(2026, 10, 1)
    result = await service.set_availability(
        manager,
        uuid.uuid4(),
        EmployeeAvailabilityPut(
            periods=[
                EmployeeAvailabilityWrite(
                    period_start=start,
                    period_end=start + timedelta(days=90),
                    status=AvailabilityStatus.PARTIALLY_AVAILABLE,
                    base_capacity_percent=50,
                )
            ]
        ),
    )
    assert len(result) == 1
    assert repo.replaced_availability is result


@pytest.mark.asyncio
async def test_add_requirement_requires_edit_permission() -> None:
    project = Project(organization_id=ORG_A, name="Atlas")
    service = ProjectService(StubProjectRepo(project))  # type: ignore[arg-type]
    viewer = _principal(Permission.PROJECTS_VIEW)
    with pytest.raises(PermissionDenied):
        await service.add_requirement(
            viewer, uuid.uuid4(), ProjectRoleRequirementCreate(role_name="Backend Dev")
        )


@pytest.mark.asyncio
async def test_add_requirement_sets_project_and_org() -> None:
    project = Project(organization_id=ORG_A, name="Atlas")
    repo = StubProjectRepo(project)
    service = ProjectService(repo)  # type: ignore[arg-type]
    editor = _principal(Permission.PROJECTS_EDIT)
    project_id = uuid.uuid4()
    requirement = await service.add_requirement(
        editor,
        project_id,
        ProjectRoleRequirementCreate(role_name="Backend Dev", headcount=2),
    )
    assert requirement.organization_id == ORG_A
    assert requirement.project_id == project_id
    assert requirement.headcount == 2


@pytest.mark.asyncio
async def test_update_requirement_version_conflict() -> None:
    requirement = ProjectRoleRequirement(
        organization_id=ORG_A, project_id=uuid.uuid4(), role_name="Backend Dev"
    )
    requirement.version = 4
    repo = StubProjectRepo()
    repo.requirement = requirement
    service = ProjectService(repo)  # type: ignore[arg-type]
    editor = _principal(Permission.PROJECTS_EDIT)
    with pytest.raises(ConflictError):
        await service.update_requirement(
            editor,
            uuid.uuid4(),
            ProjectRoleRequirementUpdate(role_name="Lead", version=1),
        )


@pytest.mark.asyncio
async def test_update_requirement_enforces_org_isolation() -> None:
    requirement = ProjectRoleRequirement(
        organization_id=ORG_B, project_id=uuid.uuid4(), role_name="Secret"
    )
    repo = StubProjectRepo()
    repo.requirement = requirement
    service = ProjectService(repo)  # type: ignore[arg-type]
    editor = _principal(Permission.PROJECTS_EDIT, org=ORG_A)
    with pytest.raises(NotFound):
        await service.update_requirement(
            editor,
            uuid.uuid4(),
            ProjectRoleRequirementUpdate(role_name="Lead", version=0),
        )
