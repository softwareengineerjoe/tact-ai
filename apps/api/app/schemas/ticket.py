"""Ticket schemas (MASTER FR-010). Separate Create/Update/Read models."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.core.enums import TicketPriority, TicketStatus, TicketType


class TicketCreate(BaseModel):
    title: str = Field(min_length=1, max_length=240)
    description: str | None = None
    ticket_type: TicketType = TicketType.TASK
    priority: TicketPriority = TicketPriority.MEDIUM
    assignee_id: uuid.UUID | None = None
    reviewer_id: uuid.UUID | None = None
    story_points: int | None = Field(default=None, ge=0, le=100)
    due_date: datetime | None = None


class TicketUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=240)
    description: str | None = None
    ticket_type: TicketType | None = None
    priority: TicketPriority | None = None
    story_points: int | None = Field(default=None, ge=0, le=100)
    due_date: datetime | None = None
    version: int  # optimistic concurrency (MASTER 23)


class TicketAssign(BaseModel):
    assignee_id: uuid.UUID | None = None
    reviewer_id: uuid.UUID | None = None
    version: int


class TicketTransition(BaseModel):
    status: TicketStatus
    # Required when moving to BLOCKED (MASTER FR-010).
    blocker_reason: str | None = None
    version: int


class CommentCreate(BaseModel):
    body: str = Field(min_length=1, max_length=4000)


class CommentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    ticket_id: uuid.UUID
    author_id: uuid.UUID
    body: str
    created_at: datetime


class TicketActivityRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    ticket_id: uuid.UUID
    actor_id: uuid.UUID
    action: str
    detail: str | None
    created_at: datetime


class TicketRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organization_id: uuid.UUID
    project_id: uuid.UUID
    title: str
    description: str | None
    ticket_type: TicketType
    status: TicketStatus
    priority: TicketPriority
    assignee_id: uuid.UUID | None
    reviewer_id: uuid.UUID | None
    story_points: int | None
    due_date: datetime | None
    blocker_reason: str | None
    version: int
    created_at: datetime
    updated_at: datetime
    # Enriched labels for display (not persisted on the ticket).
    assignee_name: str | None = None
    reviewer_name: str | None = None


class TicketDetailRead(TicketRead):
    comments: list[CommentRead] = []
    activity: list[TicketActivityRead] = []
