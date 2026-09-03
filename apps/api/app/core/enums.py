"""Shared enums defined once and reused by models and schemas (MASTER FR-002)."""

from enum import StrEnum


class ProjectStatus(StrEnum):
    DRAFT = "draft"
    STAFFING = "staffing"
    READY_FOR_APPROVAL = "ready_for_approval"
    ACTIVE = "active"
    ON_HOLD = "on_hold"
    CLOSING = "closing"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class ProjectPriority(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TicketProvider(StrEnum):
    NATIVE = "native"
    JIRA = "jira"
    AZURE_DEVOPS = "azure_devops"


class EmploymentStatus(StrEnum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ON_LEAVE = "on_leave"
    UNAVAILABLE = "unavailable"
    ARCHIVED = "archived"


class ProficiencyLevel(StrEnum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


class AvailabilityStatus(StrEnum):
    AVAILABLE = "available"
    PARTIALLY_AVAILABLE = "partially_available"
    FULLY_ALLOCATED = "fully_allocated"
    OVERALLOCATED = "overallocated"
    UNAVAILABLE = "unavailable"
    UNKNOWN = "unknown"


class AssignmentStatus(StrEnum):
    RECOMMENDED = "recommended"
    RESERVED = "reserved"
    PENDING_APPROVAL = "pending_approval"
    CONFIRMED = "confirmed"
    ACTIVE = "active"
    ENDED = "ended"
    REJECTED = "rejected"
    EXPIRED = "expired"
    DECLINED = "declined"
    CANCELLED = "cancelled"
