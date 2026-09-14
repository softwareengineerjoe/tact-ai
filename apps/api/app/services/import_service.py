"""Employee CSV import (MASTER FR-019, Phase 1).

Deterministic, org-scoped bulk load of employees from CSV text. Each row is
validated independently; valid rows upsert an employee by ``employee_code`` and
invalid rows are reported without aborting the whole import (MASTER section 25
Import Review). Processing is synchronous for the MVP but persisted as a job with
a per-row result trail so it stays auditable and reviewable.

Expected columns (header row, case-insensitive):
    employee_code, display_name, email,
    job_title, department, primary_role, time_zone, employment_status
"""

import csv
import io
import uuid

from app.core.enums import EmploymentStatus, ImportRowStatus, ImportStatus
from app.core.exceptions import NotFound, ValidationError
from app.models.employee import Employee
from app.models.import_job import ImportJob, ImportRowResult
from app.repositories.employee_repository import EmployeeRepository
from app.repositories.import_repository import ImportRepository
from app.schemas.import_job import ImportCreate
from app.security.permissions import Permission
from app.security.principal import Principal

# Guardrail: reject oversized payloads before parsing (MASTER section 23).
MAX_CONTENT_BYTES = 2_000_000
_REQUIRED_COLUMNS = ("employee_code", "display_name", "email")
_OPTIONAL_COLUMNS = (
    "job_title",
    "department",
    "primary_role",
    "time_zone",
    "employment_status",
)
_VALID_STATUSES = frozenset(s.value for s in EmploymentStatus)


class ImportService:
    def __init__(
        self,
        import_repository: ImportRepository,
        employee_repository: EmployeeRepository,
    ) -> None:
        self._imports = import_repository
        self._employees = employee_repository

    async def import_employees(self, principal: Principal, data: ImportCreate) -> ImportJob:
        principal.require(Permission.PEOPLE_EDIT)

        if len(data.content.encode("utf-8")) > MAX_CONTENT_BYTES:
            raise ValidationError("The import file is too large.")

        organization_id = principal.organization_id
        job = await self._imports.add_job(
            ImportJob(
                organization_id=organization_id,
                created_by=principal.user_id,
                kind=data.kind,
                filename=data.filename,
                status=ImportStatus.PROCESSING,
            )
        )

        try:
            rows = self._parse_rows(data.content)
        except ValidationError as exc:
            job.status = ImportStatus.FAILED
            job.error = str(exc)
            return job

        created = updated = invalid = 0
        for index, row in enumerate(rows, start=1):
            result = await self._process_row(organization_id, index, row)
            await self._imports.add_row(result)
            if result.status == ImportRowStatus.CREATED:
                created += 1
            elif result.status == ImportRowStatus.UPDATED:
                updated += 1
            elif result.status == ImportRowStatus.INVALID:
                invalid += 1

        job.total_rows = len(rows)
        job.created_count = created
        job.updated_count = updated
        job.invalid_count = invalid
        job.status = ImportStatus.COMPLETED
        return job

    async def get_import(self, principal: Principal, import_id: uuid.UUID) -> ImportJob:
        principal.require(Permission.PEOPLE_VIEW)
        job = await self._imports.get(principal.organization_id, import_id)
        if job is None:
            raise NotFound("Import not found")
        return job

    @staticmethod
    def _parse_rows(content: str) -> list[dict[str, str]]:
        reader = csv.DictReader(io.StringIO(content))
        if reader.fieldnames is None:
            raise ValidationError("The file is empty.")

        headers = {(name or "").strip().lower(): name for name in reader.fieldnames}
        missing = [c for c in _REQUIRED_COLUMNS if c not in headers]
        if missing:
            raise ValidationError(f"Missing required columns: {', '.join(missing)}")

        rows: list[dict[str, str]] = []
        for raw in reader:
            normalized: dict[str, str] = {}
            for canonical, original in headers.items():
                if canonical in _REQUIRED_COLUMNS or canonical in _OPTIONAL_COLUMNS:
                    normalized[canonical] = (raw.get(original) or "").strip()
            rows.append(normalized)
        return rows

    async def _process_row(
        self, organization_id: uuid.UUID, row_number: int, row: dict[str, str]
    ) -> ImportRowResult:
        code = row.get("employee_code", "")
        display_name = row.get("display_name", "")
        email = row.get("email", "")

        error = self._validate_row(code, display_name, email, row.get("employment_status", ""))
        if error is not None:
            return ImportRowResult(
                organization_id=organization_id,
                row_number=row_number,
                status=ImportRowStatus.INVALID,
                identifier=code or None,
                message=error,
            )

        status = row.get("employment_status") or EmploymentStatus.ACTIVE
        existing = await self._employees.get_by_code(organization_id, code)
        if existing is None:
            await self._employees.add(
                Employee(
                    organization_id=organization_id,
                    employee_code=code,
                    display_name=display_name,
                    email=email,
                    job_title=row.get("job_title") or None,
                    department=row.get("department") or None,
                    primary_role=row.get("primary_role") or None,
                    time_zone=row.get("time_zone") or None,
                    employment_status=status,
                )
            )
            outcome = ImportRowStatus.CREATED
        else:
            existing.display_name = display_name
            existing.email = email
            existing.job_title = row.get("job_title") or existing.job_title
            existing.department = row.get("department") or existing.department
            existing.primary_role = row.get("primary_role") or existing.primary_role
            existing.time_zone = row.get("time_zone") or existing.time_zone
            existing.employment_status = status
            outcome = ImportRowStatus.UPDATED

        return ImportRowResult(
            organization_id=organization_id,
            row_number=row_number,
            status=outcome,
            identifier=code,
            message=None,
        )

    @staticmethod
    def _validate_row(
        code: str, display_name: str, email: str, employment_status: str
    ) -> str | None:
        if not code:
            return "employee_code is required."
        if not display_name:
            return "display_name is required."
        if not email or "@" not in email:
            return "A valid email is required."
        if employment_status and employment_status not in _VALID_STATUSES:
            return f"Unknown employment_status: {employment_status}."
        return None
