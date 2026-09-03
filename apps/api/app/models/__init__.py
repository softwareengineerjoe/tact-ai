"""SQLAlchemy ORM models.

Import model modules here so their tables register on ``Base.metadata`` for
Alembic autogeneration and metadata create.
"""

from app.models.base import Base
from app.models.employee import (
    Employee,
    EmployeeAvailability,
    EmployeeSkill,
    Skill,
)
from app.models.organization import Organization
from app.models.project import (
    Project,
    ProjectAssignment,
    ProjectRoleRequirement,
    RoleRequirementSkill,
)

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
]
