"""Assistant (chat) request/response schemas (MASTER 15.7, 15.8)."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SessionCreate(BaseModel):
    title: str | None = Field(default=None, max_length=200)


class CitationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    source_type: str
    source_id: str
    label: str


class MessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    role: str
    content: str
    model_version: str | None = None
    reasoning_summary: str | None = None
    warnings: list[str] | None = None
    suggested_next_action: str | None = None
    citations: list[CitationRead] = Field(default_factory=list)
    created_at: datetime


class SessionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    created_at: datetime


class SessionDetailRead(SessionRead):
    messages: list[MessageRead] = Field(default_factory=list)


class MessageCreate(BaseModel):
    content: str = Field(min_length=1, max_length=4000)
