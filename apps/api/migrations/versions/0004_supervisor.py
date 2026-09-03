"""add supervisor_id self-reference to employees

Revision ID: 0004_supervisor
Revises: 0003_team_builder
Create Date: 2026-09-05
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision: str = "0004_supervisor"
down_revision: str | None = "0003_team_builder"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "employees",
        sa.Column("supervisor_id", UUID(as_uuid=True), nullable=True),
    )
    op.create_foreign_key(
        "fk_employees_supervisor_id",
        "employees",
        "employees",
        ["supervisor_id"],
        ["id"],
    )


def downgrade() -> None:
    op.drop_constraint("fk_employees_supervisor_id", "employees", type_="foreignkey")
    op.drop_column("employees", "supervisor_id")
