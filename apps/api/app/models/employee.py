"""Employee aggregate — the internal people directory (MASTER FR-004)."""

import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import AvailabilityStatus, EmploymentStatus
from app.models.base import Base


class Employee(Base):
    __tablename__ = "employees"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    employee_code: Mapped[str] = mapped_column(String(40), nullable=False)
    display_name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    job_title: Mapped[str | None] = mapped_column(String(160))
    department: Mapped[str | None] = mapped_column(String(160))
    primary_role: Mapped[str | None] = mapped_column(String(160))
    time_zone: Mapped[str | None] = mapped_column(String(64))
    employment_status: Mapped[str] = mapped_column(
        String(32), nullable=False, default=EmploymentStatus.ACTIVE
    )

    skills: Mapped[list[EmployeeSkill]] = relationship(
        back_populates="employee", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_employees_org", "organization_id"),
        Index("ix_employees_org_code", "organization_id", "employee_code", unique=True),
    )


class EmployeeSkill(Base):
    __tablename__ = "employee_skills"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False
    )
    skill_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("skills.id"), nullable=False
    )
    proficiency_level: Mapped[str] = mapped_column(String(32), nullable=False)
    years_of_experience: Mapped[int | None] = mapped_column()

    employee: Mapped[Employee] = relationship(back_populates="skills")
    skill: Mapped[Skill] = relationship()

    __table_args__ = (
        Index("ix_employee_skills_org", "organization_id"),
        Index(
            "ix_employee_skills_unique",
            "employee_id",
            "skill_id",
            unique=True,
        ),
    )


class Skill(Base):
    __tablename__ = "skills"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    category: Mapped[str | None] = mapped_column(String(120))

    __table_args__ = (
        Index("ix_skills_org", "organization_id"),
        Index("ix_skills_org_name", "organization_id", "name", unique=True),
    )


class EmployeeAvailability(Base):
    """Manually recorded availability for a period (MASTER FR-006).

    Capacity is computed from these records in Sprint 3; here we only store the
    manager-entered inputs.
    """

    __tablename__ = "employee_availability"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False
    )
    period_start: Mapped[datetime] = mapped_column(nullable=False)
    period_end: Mapped[datetime] = mapped_column(nullable=False)
    status: Mapped[str] = mapped_column(
        String(32), nullable=False, default=AvailabilityStatus.UNKNOWN
    )
    base_capacity_percent: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
    note: Mapped[str | None] = mapped_column(Text)
    data_source: Mapped[str | None] = mapped_column(String(64))

    __table_args__ = (
        Index("ix_employee_availability_org", "organization_id"),
        Index("ix_employee_availability_employee", "employee_id"),
    )
