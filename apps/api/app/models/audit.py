"""General write-action audit log (MASTER 28, 39.12).

Records mutating domain actions (create/update/assign/transition/acknowledge)
so sensitive changes have a durable, org-scoped trail. This complements the
per-aggregate history (ticket activity, feedback revisions) with a single
cross-cutting stream that ``audit.view`` can read.
"""

import uuid

from sqlalchemy import ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    actor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    action: Mapped[str] = mapped_column(String(64), nullable=False)
    resource_type: Mapped[str] = mapped_column(String(48), nullable=False)
    resource_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    detail: Mapped[str | None] = mapped_column(Text, nullable=True)

    __table_args__ = (
        Index("ix_audit_logs_org", "organization_id"),
        Index("ix_audit_logs_resource", "resource_type", "resource_id"),
    )
