"""add native tickets, comments, and activity

Revision ID: 0005_tickets
Revises: 0004_supervisor
Create Date: 2026-09-04
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision: str = "0005_tickets"
down_revision: str | None = "0004_supervisor"
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
        "tickets",
        *_timestamps(),
        sa.Column("organization_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("project_id", UUID(as_uuid=True), sa.ForeignKey("projects.id"), nullable=False),
        sa.Column("title", sa.String(length=240), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("ticket_type", sa.String(length=24), nullable=False, server_default="task"),
        sa.Column("status", sa.String(length=24), nullable=False, server_default="backlog"),
        sa.Column("priority", sa.String(length=16), nullable=False, server_default="medium"),
        sa.Column("assignee_id", UUID(as_uuid=True), sa.ForeignKey("employees.id"), nullable=True),
        sa.Column("reviewer_id", UUID(as_uuid=True), sa.ForeignKey("employees.id"), nullable=True),
        sa.Column("story_points", sa.Integer(), nullable=True),
        sa.Column("due_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("blocker_reason", sa.Text(), nullable=True),
        sa.Column("external_provider", sa.String(length=24), nullable=True),
        sa.Column("external_id", sa.String(length=120), nullable=True),
    )
    op.create_index("ix_tickets_org", "tickets", ["organization_id"])
    op.create_index("ix_tickets_project", "tickets", ["project_id"])
    op.create_index("ix_tickets_assignee", "tickets", ["assignee_id"])

    op.create_table(
        "ticket_comments",
        *_timestamps(),
        sa.Column("organization_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("ticket_id", UUID(as_uuid=True), sa.ForeignKey("tickets.id"), nullable=False),
        sa.Column("author_id", UUID(as_uuid=True), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
    )
    op.create_index("ix_ticket_comments_org", "ticket_comments", ["organization_id"])
    op.create_index("ix_ticket_comments_ticket", "ticket_comments", ["ticket_id"])

    op.create_table(
        "ticket_activity",
        *_timestamps(),
        sa.Column("organization_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("ticket_id", UUID(as_uuid=True), sa.ForeignKey("tickets.id"), nullable=False),
        sa.Column("actor_id", UUID(as_uuid=True), nullable=False),
        sa.Column("action", sa.String(length=48), nullable=False),
        sa.Column("detail", sa.Text(), nullable=True),
    )
    op.create_index("ix_ticket_activity_org", "ticket_activity", ["organization_id"])
    op.create_index("ix_ticket_activity_ticket", "ticket_activity", ["ticket_id"])


def downgrade() -> None:
    op.drop_table("ticket_activity")
    op.drop_table("ticket_comments")
    op.drop_table("tickets")
