"""Employee and skill schemas (MASTER FR-004)."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.core.enums import AvailabilityStatus, EmploymentStatus, ProficiencyLevel


class SkillRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    category: str | None


class EmployeeSkillRead(BaseModel):
    id: uuid.UUID
    skill_id: uuid.UUID
    skill_name: str
    category: str | None
    proficiency_level: ProficiencyLevel
    years_of_experience: int | None


class EmployeeSkillWrite(BaseModel):
    skill_name: str = Field(min_length=1, max_length=120)
    category: str | None = Field(default=None, max_length=120)
    proficiency_level: ProficiencyLevel
    years_of_experience: int | None = Field(default=None, ge=0)


class EmployeeSkillsPut(BaseModel):
    """Full replacement of an employee's skill set."""

    skills: list[EmployeeSkillWrite]


class EmployeeAvailabilityRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    period_start: datetime
    period_end: datetime
    status: AvailabilityStatus
    base_capacity_percent: int
    note: str | None
    data_source: str | None


class EmployeeAvailabilityWrite(BaseModel):
    period_start: datetime
    period_end: datetime
    status: AvailabilityStatus = AvailabilityStatus.UNKNOWN
    base_capacity_percent: int = Field(default=100, ge=0, le=100)
    note: str | None = None
    data_source: str | None = Field(default=None, max_length=64)


class EmployeeAvailabilityPut(BaseModel):
    """Full replacement of an employee's availability periods."""

    periods: list[EmployeeAvailabilityWrite]


class EmployeeCreate(BaseModel):
    employee_code: str = Field(min_length=1, max_length=40)
    display_name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    job_title: str | None = None
    department: str | None = None
    primary_role: str | None = None
    time_zone: str | None = None
    employment_status: EmploymentStatus = EmploymentStatus.ACTIVE


class EmployeeUpdate(BaseModel):
    display_name: str | None = Field(default=None, min_length=1, max_length=200)
    job_title: str | None = None
    department: str | None = None
    primary_role: str | None = None
    time_zone: str | None = None
    employment_status: EmploymentStatus | None = None
    version: int  # optimistic concurrency (MASTER 23)


class EmployeeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organization_id: uuid.UUID
    employee_code: str
    display_name: str
    email: str
    job_title: str | None
    department: str | None
    primary_role: str | None
    time_zone: str | None
    employment_status: EmploymentStatus
    version: int
    created_at: datetime
    updated_at: datetime
