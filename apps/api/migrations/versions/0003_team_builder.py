"""add role_requirement_skills and project_assignments tables

Revision ID: 0003_team_builder
Revises: 0002_availability
Create Date: 2026-09-04
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision: str = "0003_team_builder"
down_revision: str | None = "0002_availability"
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
        "role_requirement_skills",
        *_base_columns(),
        sa.Column(
            "organization_id",
            UUID(as_uuid=True),
            sa.ForeignKey("organizations.id"),
            nullable=False,
        ),
        sa.Column(
            "requirement_id",
            UUID(as_uuid=True),
            sa.ForeignKey("project_role_requirements.id"),
            nullable=False,
        ),
        sa.Column(
            "skill_id",
            UUID(as_uuid=True),
            sa.ForeignKey("skills.id"),
            nullable=False,
        ),
        sa.Column(
            "is_preferred", sa.Boolean(), nullable=False, server_default=sa.false()
        ),
    )
    op.create_index(
        "ix_role_requirement_skills_org",
        "role_requirement_skills",
        ["organization_id"],
    )
    op.create_index(
        "ix_role_requirement_skills_requirement",
        "role_requirement_skills",
        ["requirement_id"],
    )

    op.create_table(
        "project_assignments",
        *_base_columns(),
        sa.Column(
            "organization_id",
            UUID(as_uuid=True),
            sa.ForeignKey("organizations.id"),
            nullable=False,
        ),
        sa.Column(
            "project_id",
            UUID(as_uuid=True),
            sa.ForeignKey("projects.id"),
            nullable=False,
        ),
        sa.Column(
            "role_requirement_id",
            UUID(as_uuid=True),
            sa.ForeignKey("project_role_requirements.id"),
            nullable=False,
        ),
        sa.Column(
            "employee_id",
            UUID(as_uuid=True),
            sa.ForeignKey("employees.id"),
            nullable=False,
        ),
        sa.Column(
            "status", sa.String(length=32), nullable=False, server_default="reserved"
        ),
        sa.Column(
            "allocation_percent", sa.Integer(), nullable=False, server_default="100"
        ),
        sa.Column("start_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("end_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("override_reason", sa.Text(), nullable=True),
    )
    op.create_index(
        "ix_project_assignments_org", "project_assignments", ["organization_id"]
    )
    op.create_index(
        "ix_project_assignments_project", "project_assignments", ["project_id"]
    )
    op.create_index(
        "ix_project_assignments_employee", "project_assignments", ["employee_id"]
    )


def downgrade() -> None:
    op.drop_table("project_assignments")
    op.drop_table("role_requirement_skills")
