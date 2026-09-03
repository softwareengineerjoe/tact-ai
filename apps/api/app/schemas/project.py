"""Project request/response schemas (MASTER FR-002, FR-003)."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from pydantic import BaseModel, ConfigDict, Field

from app.core.enums import ProjectPriority, ProjectStatus, TicketProvider

if TYPE_CHECKING:
    from app.models.project import ProjectRoleRequirement


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: str | None = None
    business_objective: str | None = None
    priority: ProjectPriority = ProjectPriority.MEDIUM
    manager_id: uuid.UUID | None = None
    start_date: datetime | None = None
    target_end_date: datetime | None = None
    ticket_provider: TicketProvider = TicketProvider.NATIVE
    expected_team_size: int | None = Field(default=None, ge=1)


class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    business_objective: str | None = None
    priority: ProjectPriority | None = None
    status: ProjectStatus | None = None
    manager_id: uuid.UUID | None = None
    start_date: datetime | None = None
    target_end_date: datetime | None = None
    ticket_provider: TicketProvider | None = None
    expected_team_size: int | None = Field(default=None, ge=1)
    version: int  # required for optimistic concurrency (MASTER 23)


class ProjectRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organization_id: uuid.UUID
    name: str
    description: str | None
    business_objective: str | None
    priority: ProjectPriority
    status: ProjectStatus
    manager_id: uuid.UUID | None
    start_date: datetime | None
    target_end_date: datetime | None
    ticket_provider: TicketProvider
    expected_team_size: int | None
    version: int
    created_at: datetime
    updated_at: datetime


class ProjectRoleRequirementCreate(BaseModel):
    role_name: str = Field(min_length=1, max_length=160)
    headcount: int = Field(default=1, ge=1)
    allocation_percent: int = Field(default=100, ge=0, le=100)
    description: str | None = None
    required_skills: list[str] = Field(default_factory=list)
    preferred_skills: list[str] = Field(default_factory=list)


class ProjectRoleRequirementUpdate(BaseModel):
    role_name: str | None = Field(default=None, min_length=1, max_length=160)
    headcount: int | None = Field(default=None, ge=1)
    allocation_percent: int | None = Field(default=None, ge=0, le=100)
    description: str | None = None
    version: int  # required for optimistic concurrency (MASTER 23)


class ProjectRoleRequirementRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organization_id: uuid.UUID
    project_id: uuid.UUID
    role_name: str
    headcount: int
    allocation_percent: int
    description: str | None
    required_skills: list[str] = Field(default_factory=list)
    preferred_skills: list[str] = Field(default_factory=list)
    version: int
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_model(cls, requirement: ProjectRoleRequirement) -> ProjectRoleRequirementRead:
        """Map the ORM requirement, splitting skills by preferred flag."""
        required = [rs.skill.name for rs in requirement.required_skills if not rs.is_preferred]
        preferred = [rs.skill.name for rs in requirement.required_skills if rs.is_preferred]
        return cls(
            id=requirement.id,
            organization_id=requirement.organization_id,
            project_id=requirement.project_id,
            role_name=requirement.role_name,
            headcount=requirement.headcount,
            allocation_percent=requirement.allocation_percent,
            description=requirement.description,
            required_skills=required,
            preferred_skills=preferred,
            version=requirement.version,
            created_at=requirement.created_at,
            updated_at=requirement.updated_at,
        )
