"""SQLAlchemy ORM models.

Import model modules here so their tables register on ``Base.metadata`` for
Alembic autogeneration and metadata create.
"""

from app.models.audit import AuditLog
from app.models.base import Base
from app.models.chat import (
    AIToolExecution,
    ChatMessage,
    ChatSession,
    MessageCitation,
)
from app.models.employee import (
    Employee,
    EmployeeAvailability,
    EmployeeSkill,
    Skill,
)
from app.models.feedback import (
    Feedback,
    FeedbackAccessLog,
    FeedbackAcknowledgement,
    FeedbackRevision,
)
from app.models.organization import Organization
from app.models.project import (
    Project,
    ProjectAssignment,
    ProjectRoleRequirement,
    RoleRequirementSkill,
)
from app.models.ticket import Ticket, TicketActivity, TicketComment

__all__ = [
    "Base",
    "Organization",
    "Employee",
    "EmployeeAvailability",
    "EmployeeSkill",
    "Skill",
    "Project",
    "ProjectAssignment",
    "ProjectRoleRequirement",
    "RoleRequirementSkill",
    "Ticket",
    "TicketComment",
    "TicketActivity",
    "Feedback",
    "FeedbackRevision",
    "FeedbackAcknowledgement",
    "FeedbackAccessLog",
    "AuditLog",
    "ChatSession",
    "ChatMessage",
    "AIToolExecution",
    "MessageCitation",
]
