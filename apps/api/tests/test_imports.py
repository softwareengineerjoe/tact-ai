"""Unit tests for employee CSV import (MASTER FR-019).

Stub repositories exercise permission enforcement, header validation, per-row
validation, create vs update upsert, and org scoping without a database.
"""

import uuid

import pytest
from app.core.enums import ImportStatus
from app.core.exceptions import NotFound, PermissionDenied
from app.models.employee import Employee
from app.models.import_job import ImportJob, ImportRowResult
from app.schemas.import_job import ImportCreate
from app.security.permissions import Permission
from app.security.principal import Principal
from app.services.import_service import ImportService

ORG = uuid.UUID("00000000-0000-0000-0000-0000000000e1")

HEADER = "employee_code,display_name,email,job_title,department"


def _principal(*permissions: Permission, organization_id: uuid.UUID = ORG) -> Principal:
    return Principal(
        user_id=uuid.uuid4(),
        organization_id=organization_id,
        roles=frozenset(),
        permissions=frozenset(permissions),
    )


class StubImportRepo:
    def __init__(self) -> None:
        self.rows: list[ImportRowResult] = []
        self.job: ImportJob | None = None

    async def add_job(self, job: ImportJob) -> ImportJob:
        job.id = uuid.uuid4()
        self.job = job
        return job

    async def add_row(self, row: ImportRowResult) -> ImportRowResult:
        self.rows.append(row)
        return row

    async def get(self, organization_id, import_id):  # type: ignore[no-untyped-def]
        if self.job and self.job.organization_id == organization_id and self.job.id == import_id:
            return self.job
        return None


class StubEmployeeRepo:
    def __init__(self, existing: list[Employee] | None = None) -> None:
        self.employees: list[Employee] = existing or []
        self.added: list[Employee] = []

    async def get_by_code(self, organization_id, employee_code):  # type: ignore[no-untyped-def]
        for e in self.employees:
            if e.organization_id == organization_id and e.employee_code == employee_code:
                return e
        return None

    async def add(self, employee: Employee) -> Employee:
        employee.id = uuid.uuid4()
        self.employees.append(employee)
        self.added.append(employee)
        return employee


def _service(employee_repo: StubEmployeeRepo | None = None) -> ImportService:
    return ImportService(
        StubImportRepo(),  # type: ignore[arg-type]
        employee_repo or StubEmployeeRepo(),  # type: ignore[arg-type]
    )


def _csv(*rows: str) -> str:
    return "\n".join([HEADER, *rows])


@pytest.mark.asyncio
async def test_import_requires_people_edit() -> None:
    service = _service()
    with pytest.raises(PermissionDenied):
        await service.import_employees(_principal(), ImportCreate(filename="e.csv", content=_csv()))


@pytest.mark.asyncio
async def test_import_creates_new_employees() -> None:
    employees = StubEmployeeRepo()
    service = _service(employees)
    content = _csv("E1,Maria Santos,maria@example.com,Engineer,Platform")

    job = await service.import_employees(
        _principal(Permission.PEOPLE_EDIT),
        ImportCreate(filename="e.csv", content=content),
    )

    assert job.status == ImportStatus.COMPLETED
    assert job.created_count == 1
    assert job.invalid_count == 0
    assert len(employees.added) == 1
    assert employees.added[0].employee_code == "E1"


@pytest.mark.asyncio
async def test_import_updates_existing_by_code() -> None:
    existing = Employee(
        organization_id=ORG,
        employee_code="E1",
        display_name="Old Name",
        email="old@example.com",
    )
    existing.id = uuid.uuid4()
    employees = StubEmployeeRepo([existing])
    service = _service(employees)
    content = _csv("E1,New Name,new@example.com,Engineer,Platform")

    job = await service.import_employees(
        _principal(Permission.PEOPLE_EDIT),
        ImportCreate(filename="e.csv", content=content),
    )

    assert job.updated_count == 1
    assert job.created_count == 0
    assert existing.display_name == "New Name"
    assert existing.email == "new@example.com"


@pytest.mark.asyncio
async def test_import_reports_invalid_rows_without_aborting() -> None:
    employees = StubEmployeeRepo()
    service = _service(employees)
    content = _csv(
        "E1,Maria Santos,maria@example.com,Engineer,Platform",
        ",Missing Code,noone@example.com,,",
        "E3,No Email,not-an-email,,",
    )

    job = await service.import_employees(
        _principal(Permission.PEOPLE_EDIT),
        ImportCreate(filename="e.csv", content=content),
    )

    assert job.total_rows == 3
    assert job.created_count == 1
    assert job.invalid_count == 2


@pytest.mark.asyncio
async def test_import_fails_on_missing_required_columns() -> None:
    service = _service()
    content = "name,email\nMaria,maria@example.com"

    job = await service.import_employees(
        _principal(Permission.PEOPLE_EDIT),
        ImportCreate(filename="e.csv", content=content),
    )

    assert job.status == ImportStatus.FAILED
    assert job.error is not None
    assert "employee_code" in job.error


@pytest.mark.asyncio
async def test_get_import_requires_people_view() -> None:
    service = _service()
    with pytest.raises(PermissionDenied):
        await service.get_import(_principal(), uuid.uuid4())


@pytest.mark.asyncio
async def test_get_import_unknown_raises_not_found() -> None:
    service = _service()
    with pytest.raises(NotFound):
        await service.get_import(_principal(Permission.PEOPLE_VIEW), uuid.uuid4())
