"""add chat aggregate for the AI assistant

Revision ID: 0008_chat
Revises: 0007_audit
Create Date: 2026-09-05
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB, UUID

revision: str = "0008_chat"
down_revision: str | None = "0007_audit"
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
        "chat_sessions",
        *_timestamps(),
        sa.Column("organization_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("user_id", UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False, server_default="New conversation"),
        sa.Column("foundry_conversation_id", sa.String(length=128), nullable=True),
    )
    op.create_index("ix_chat_sessions_org", "chat_sessions", ["organization_id"])
    op.create_index("ix_chat_sessions_user", "chat_sessions", ["user_id"])

    op.create_table(
        "chat_messages",
        *_timestamps(),
        sa.Column("organization_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("session_id", UUID(as_uuid=True), sa.ForeignKey("chat_sessions.id"), nullable=False),
        sa.Column("role", sa.String(length=16), nullable=False, server_default="user"),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("model_version", sa.String(length=64), nullable=True),
        sa.Column("prompt_version", sa.String(length=32), nullable=True),
        sa.Column("reasoning_summary", sa.Text(), nullable=True),
        sa.Column("warnings", JSONB(), nullable=True),
        sa.Column("suggested_next_action", sa.Text(), nullable=True),
        sa.Column("token_usage", sa.Integer(), nullable=True),
    )
    op.create_index("ix_chat_messages_org", "chat_messages", ["organization_id"])
    op.create_index("ix_chat_messages_session", "chat_messages", ["session_id"])

    op.create_table(
        "ai_tool_executions",
        *_timestamps(),
        sa.Column("organization_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("message_id", UUID(as_uuid=True), sa.ForeignKey("chat_messages.id"), nullable=False),
        sa.Column("tool_name", sa.String(length=64), nullable=False),
        sa.Column("arguments", JSONB(), nullable=True),
        sa.Column("succeeded", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("error", sa.Text(), nullable=True),
    )
    op.create_index("ix_ai_tool_executions_org", "ai_tool_executions", ["organization_id"])
    op.create_index("ix_ai_tool_executions_message", "ai_tool_executions", ["message_id"])

    op.create_table(
        "message_citations",
        *_timestamps(),
        sa.Column("organization_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("message_id", UUID(as_uuid=True), sa.ForeignKey("chat_messages.id"), nullable=False),
        sa.Column("source_type", sa.String(length=32), nullable=False),
        sa.Column("source_id", sa.String(length=64), nullable=False),
        sa.Column("label", sa.String(length=200), nullable=False),
    )
    op.create_index("ix_message_citations_org", "message_citations", ["organization_id"])
    op.create_index("ix_message_citations_message", "message_citations", ["message_id"])


def downgrade() -> None:
    op.drop_table("message_citations")
    op.drop_table("ai_tool_executions")
    op.drop_table("chat_messages")
    op.drop_table("chat_sessions")
