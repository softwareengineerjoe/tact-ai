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


class TicketType(StrEnum):
    EPIC = "epic"
    USER_STORY = "user_story"
    TASK = "task"
    BUG = "bug"
    IMPROVEMENT = "improvement"
    SUPPORT_ISSUE = "support_issue"


class TicketStatus(StrEnum):
    BACKLOG = "backlog"
    READY = "ready"
    IN_PROGRESS = "in_progress"
    BLOCKED = "blocked"
    IN_REVIEW = "in_review"
    DONE = "done"
    CANCELLED = "cancelled"


class TicketPriority(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class FeedbackCategory(StrEnum):
    RECOGNITION = "recognition"
    STRENGTH = "strength"
    IMPROVEMENT_AREA = "improvement_area"
    COACHING = "coaching"
    PROJECT_CONTRIBUTION = "project_contribution"
    FOLLOW_UP = "follow_up"


class FeedbackVisibility(StrEnum):
    MANAGER_ONLY = "manager_only"
    MANAGER_AND_EMPLOYEE = "manager_and_employee"
    PROJECT_LEADERSHIP = "project_leadership"
    HR_PARTNER = "hr_partner"


class FeedbackStatus(StrEnum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    SHARED = "shared"
    ACKNOWLEDGED = "acknowledged"
    CLOSED = "closed"


class MessageRole(StrEnum):
    """Author of a chat message (MASTER 15.8)."""

    USER = "user"
    ASSISTANT = "assistant"


class NotificationType(StrEnum):
    """In-app notification categories (MASTER FR-018)."""

    ASSIGNMENT_CREATED = "assignment_created"
    ASSIGNMENT_CONFIRMED = "assignment_confirmed"
    TICKET_ASSIGNED = "ticket_assigned"
    TICKET_DUE_SOON = "ticket_due_soon"
    TICKET_BLOCKED = "ticket_blocked"
    REVIEW_REQUESTED = "review_requested"
    FEEDBACK_SHARED = "feedback_shared"
    CAPACITY_CONFLICT = "capacity_conflict"
    ROLE_UNFILLED = "role_unfilled"
    AI_ACTION_PENDING = "ai_action_pending"
    INTEGRATION_SYNC_FAILED = "integration_sync_failed"


class ImportKind(StrEnum):
    """What an import job loads (MASTER FR-019, 16.2)."""

    EMPLOYEES = "employees"


class ImportStatus(StrEnum):
    """Lifecycle of an import job."""

    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class ImportRowStatus(StrEnum):
    """Outcome of a single imported row."""

    CREATED = "created"
    UPDATED = "updated"
    SKIPPED = "skipped"
    INVALID = "invalid"
