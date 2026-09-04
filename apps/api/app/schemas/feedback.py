"""Feedback schemas (MASTER FR-011). Separate Create/Update/Read models."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.core.enums import FeedbackCategory, FeedbackStatus, FeedbackVisibility


class FeedbackCreate(BaseModel):
    employee_id: uuid.UUID
    category: FeedbackCategory = FeedbackCategory.RECOGNITION
    visibility: FeedbackVisibility = FeedbackVisibility.MANAGER_ONLY
    body: str = Field(min_length=1, max_length=8000)


class FeedbackUpdate(BaseModel):
    category: FeedbackCategory | None = None
    visibility: FeedbackVisibility | None = None
    body: str | None = Field(default=None, min_length=1, max_length=8000)
    status: FeedbackStatus | None = None
    version: int  # optimistic concurrency (MASTER 23)


class FeedbackRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organization_id: uuid.UUID
    project_id: uuid.UUID
    employee_id: uuid.UUID
    author_id: uuid.UUID
    category: FeedbackCategory
    visibility: FeedbackVisibility
    body: str
    status: FeedbackStatus
    version: int
    created_at: datetime
    updated_at: datetime
    employee_name: str | None = None
    is_private: bool = False
