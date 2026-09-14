"""Import job aggregate (MASTER FR-019, section 20).

An import job records a bulk load (currently employees from CSV) together with a
per-row result trail, so imports are auditable and reviewable. The MVP processes
imports synchronously; the job/result model keeps the door open for background
processing later without changing the API surface.
"""

import uuid

from sqlalchemy import ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import ImportKind, ImportRowStatus, ImportStatus
from app.models.base import Base


class ImportJob(Base):
    __tablename__ = "import_jobs"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    kind: Mapped[str] = mapped_column(String(32), nullable=False, default=ImportKind.EMPLOYEES)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(24), nullable=False, default=ImportStatus.PENDING)
    total_rows: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    updated_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    invalid_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)

    rows: Mapped[list[ImportRowResult]] = relationship(
        back_populates="job", cascade="all, delete-orphan"
    )

    __table_args__ = (Index("ix_import_jobs_org", "organization_id"),)


class ImportRowResult(Base):
    __tablename__ = "import_row_results"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    import_job_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("import_jobs.id"), nullable=False
    )
    row_number: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default=ImportRowStatus.INVALID)
    identifier: Mapped[str | None] = mapped_column(String(255), nullable=True)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)

    job: Mapped[ImportJob] = relationship(back_populates="rows")

    __table_args__ = (Index("ix_import_row_results_job", "import_job_id"),)
