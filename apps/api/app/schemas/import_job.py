"""Import job schemas (MASTER FR-019).

The MVP imports employees from CSV text. The request carries the file name and
raw CSV content; the backend parses, validates, and upserts synchronously, then
returns a reviewable job with per-row results (MASTER section 25 Import Review).
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.core.enums import ImportKind, ImportRowStatus, ImportStatus


class ImportCreate(BaseModel):
    kind: ImportKind = ImportKind.EMPLOYEES
    filename: str = Field(min_length=1, max_length=255)
    content: str = Field(min_length=1, description="Raw CSV file content")


class ImportRowResultRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    row_number: int
    status: ImportRowStatus
    identifier: str | None
    message: str | None


class ImportJobRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    kind: ImportKind
    filename: str
    status: ImportStatus
    total_rows: int
    created_count: int
    updated_count: int
    invalid_count: int
    error: str | None
    created_at: datetime
    rows: list[ImportRowResultRead]
