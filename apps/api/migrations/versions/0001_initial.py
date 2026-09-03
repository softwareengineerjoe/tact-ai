"""initial schema: organizations, employees, skills, projects

Revision ID: 0001_initial
Revises:
Create Date: 2026-09-02
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision: str = "0001_initial"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _base_columns() -> list[sa.Column]:
    return [
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("version", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    ]


def upgrade() -> None:
    op.create_table(
        "organizations",
        *_base_columns(),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("slug", sa.String(length=80), nullable=False, unique=True),
    )

    op.create_table(
        "skills",
        *_base_columns(),
        sa.Column("organization_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("category", sa.String(length=120), nullable=True),
    )
    op.create_index("ix_skills_org", "skills", ["organization_id"])
    op.create_index("ix_skills_org_name", "skills", ["organization_id", "name"], unique=True)

    op.create_table(
        "employees",
        *_base_columns(),
        sa.Column("organization_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("employee_code", sa.String(length=40), nullable=False),
        sa.Column("display_name", sa.String(length=200), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("job_title", sa.String(length=160), nullable=True),
        sa.Column("department", sa.String(length=160), nullable=True),
        sa.Column("primary_role", sa.String(length=160), nullable=True),
        sa.Column("time_zone", sa.String(length=64), nullable=True),
        sa.Column("employment_status", sa.String(length=32), nullable=False, server_default="active"),
    )
    op.create_index("ix_employees_org", "employees", ["organization_id"])
    op.create_index("ix_employees_org_code", "employees", ["organization_id", "employee_code"], unique=True)

    op.create_table(
        "employee_skills",
        *_base_columns(),
        sa.Column("organization_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("employee_id", UUID(as_uuid=True), sa.ForeignKey("employees.id"), nullable=False),
        sa.Column("skill_id", UUID(as_uuid=True), sa.ForeignKey("skills.id"), nullable=False),
        sa.Column("proficiency_level", sa.String(length=32), nullable=False),
        sa.Column("years_of_experience", sa.Integer(), nullable=True),
    )
    op.create_index("ix_employee_skills_org", "employee_skills", ["organization_id"])
    op.create_index("ix_employee_skills_unique", "employee_skills", ["employee_id", "skill_id"], unique=True)

    op.create_table(
        "projects",
        *_base_columns(),
        sa.Column("organization_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("business_objective", sa.Text(), nullable=True),
        sa.Column("priority", sa.String(length=16), nullable=False, server_default="medium"),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="draft"),
        sa.Column("manager_id", UUID(as_uuid=True), sa.ForeignKey("employees.id"), nullable=True),
        sa.Column("start_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("target_end_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("ticket_provider", sa.String(length=16), nullable=False, server_default="native"),
        sa.Column("expected_team_size", sa.Integer(), nullable=True),
    )
    op.create_index("ix_projects_org", "projects", ["organization_id"])

    op.create_table(
        "project_role_requirements",
        *_base_columns(),
        sa.Column("organization_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("project_id", UUID(as_uuid=True), sa.ForeignKey("projects.id"), nullable=False),
        sa.Column("role_name", sa.String(length=160), nullable=False),
        sa.Column("headcount", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("allocation_percent", sa.Integer(), nullable=False, server_default="100"),
        sa.Column("description", sa.Text(), nullable=True),
    )
    op.create_index("ix_project_role_requirements_org", "project_role_requirements", ["organization_id"])
    op.create_index("ix_project_role_requirements_project", "project_role_requirements", ["project_id"])


def downgrade() -> None:
    op.drop_table("project_role_requirements")
    op.drop_table("projects")
    op.drop_table("employee_skills")
    op.drop_table("employees")
    op.drop_table("skills")
    op.drop_table("organizations")
