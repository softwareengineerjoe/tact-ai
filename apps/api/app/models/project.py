"""Project aggregate and role requirements (MASTER FR-002, FR-003)."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import (
    AssignmentStatus,
    ProjectPriority,
    ProjectStatus,
    TicketProvider,
)
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.employee import Skill


class Project(Base):
    __tablename__ = "projects"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    business_objective: Mapped[str | None] = mapped_column(Text)
    priority: Mapped[str] = mapped_column(
        String(16), nullable=False, default=ProjectPriority.MEDIUM
    )
    status: Mapped[str] = mapped_column(String(32), nullable=False, default=ProjectStatus.DRAFT)
    manager_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employees.id")
    )
    start_date: Mapped[datetime | None] = mapped_column()
    target_end_date: Mapped[datetime | None] = mapped_column()
    ticket_provider: Mapped[str] = mapped_column(
        String(16), nullable=False, default=TicketProvider.NATIVE
    )
    expected_team_size: Mapped[int | None] = mapped_column(Integer)

    requirements: Mapped[list[ProjectRoleRequirement]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )

    __table_args__ = (Index("ix_projects_org", "organization_id"),)


class ProjectRoleRequirement(Base):
    __tablename__ = "project_role_requirements"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False
    )
    role_name: Mapped[str] = mapped_column(String(160), nullable=False)
    headcount: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    allocation_percent: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
    description: Mapped[str | None] = mapped_column(Text)

    project: Mapped[Project] = relationship(back_populates="requirements")
    required_skills: Mapped[list[RoleRequirementSkill]] = relationship(
        back_populates="requirement", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_project_role_requirements_org", "organization_id"),
        Index("ix_project_role_requirements_project", "project_id"),
    )


class RoleRequirementSkill(Base):
    """A required or preferred skill for a role requirement (MASTER FR-003)."""

    __tablename__ = "role_requirement_skills"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    requirement_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("project_role_requirements.id"), nullable=False
    )
    skill_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("skills.id"), nullable=False
    )
    is_preferred: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    requirement: Mapped[ProjectRoleRequirement] = relationship(back_populates="required_skills")
    skill: Mapped[Skill] = relationship()

    __table_args__ = (
        Index("ix_role_requirement_skills_org", "organization_id"),
        Index("ix_role_requirement_skills_requirement", "requirement_id"),
    )


class ProjectAssignment(Base):
    """An employee's assignment to a project role across its lifecycle.

    A single table carries the full lifecycle (MASTER FR-008); ``expires_at``
    supports temporary reservations and ``override_reason`` records an
    authorized overallocation.
    """

    __tablename__ = "project_assignments"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False
    )
    role_requirement_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("project_role_requirements.id"), nullable=False
    )
    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(32), nullable=False, default=AssignmentStatus.RESERVED
    )
    allocation_percent: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
    start_date: Mapped[datetime | None] = mapped_column()
    end_date: Mapped[datetime | None] = mapped_column()
    expires_at: Mapped[datetime | None] = mapped_column()
    override_reason: Mapped[str | None] = mapped_column(Text)

    __table_args__ = (
        Index("ix_project_assignments_org", "organization_id"),
        Index("ix_project_assignments_project", "project_id"),
        Index("ix_project_assignments_employee", "employee_id"),
    )
