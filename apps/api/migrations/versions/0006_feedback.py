"""add feedback, revisions, acknowledgements, and access log

Revision ID: 0006_feedback
Revises: 0005_tickets
Create Date: 2026-09-04
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision: str = "0006_feedback"
down_revision: str | None = "0005_tickets"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _timestamps() -> list[sa.Column]:
    return [
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("version", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    ]


def upgrade() -> None:
    op.create_table(
        "feedback",
        *_timestamps(),
        sa.Column("organization_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("project_id", UUID(as_uuid=True), sa.ForeignKey("projects.id"), nullable=False),
        sa.Column("employee_id", UUID(as_uuid=True), sa.ForeignKey("employees.id"), nullable=False),
        sa.Column("author_id", UUID(as_uuid=True), nullable=False),
        sa.Column("category", sa.String(length=32), nullable=False, server_default="recognition"),
        sa.Column("visibility", sa.String(length=32), nullable=False, server_default="manager_only"),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=24), nullable=False, server_default="draft"),
    )
    op.create_index("ix_feedback_org", "feedback", ["organization_id"])
    op.create_index("ix_feedback_project", "feedback", ["project_id"])
    op.create_index("ix_feedback_employee", "feedback", ["employee_id"])

    op.create_table(
        "feedback_revisions",
        *_timestamps(),
        sa.Column("organization_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("feedback_id", UUID(as_uuid=True), sa.ForeignKey("feedback.id"), nullable=False),
        sa.Column("editor_id", UUID(as_uuid=True), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
    )
    op.create_index("ix_feedback_revisions_org", "feedback_revisions", ["organization_id"])
    op.create_index("ix_feedback_revisions_feedback", "feedback_revisions", ["feedback_id"])

    op.create_table(
        "feedback_acknowledgements",
        *_timestamps(),
        sa.Column("organization_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("feedback_id", UUID(as_uuid=True), sa.ForeignKey("feedback.id"), nullable=False),
        sa.Column("acknowledged_by", UUID(as_uuid=True), nullable=False),
    )
    op.create_index("ix_feedback_ack_org", "feedback_acknowledgements", ["organization_id"])
    op.create_index("ix_feedback_ack_feedback", "feedback_acknowledgements", ["feedback_id"])

    op.create_table(
        "feedback_access_log",
        *_timestamps(),
        sa.Column("organization_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("feedback_id", UUID(as_uuid=True), sa.ForeignKey("feedback.id"), nullable=False),
        sa.Column("accessed_by", UUID(as_uuid=True), nullable=False),
    )
    op.create_index("ix_feedback_access_org", "feedback_access_log", ["organization_id"])
    op.create_index("ix_feedback_access_feedback", "feedback_access_log", ["feedback_id"])


def downgrade() -> None:
    op.drop_table("feedback_access_log")
    op.drop_table("feedback_acknowledgements")
    op.drop_table("feedback_revisions")
    op.drop_table("feedback")
