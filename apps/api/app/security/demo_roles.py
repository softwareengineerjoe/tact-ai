"""Demo role catalog for the MVP role selector (MASTER FR-001, section 10).

Local/demo builds resolve the acting principal from a simplified role selector
instead of a validated Entra ID token. Each demo role maps to a realistic
permission subset drawn from MASTER section 10 so RBAC differences (hidden nav,
gated actions, field-level access) can be demonstrated live.

Production authentication replaces this catalog entirely; nothing here is used
once Entra ID role -> permission resolution is in place.
"""

from dataclasses import dataclass

from app.security.permissions import Permission

_ALL_PERMISSIONS = frozenset(Permission)


@dataclass(frozen=True, slots=True)
class DemoRole:
    """A selectable demonstration role and its resolved permission set."""

    key: str
    label: str
    role_name: str
    permissions: frozenset[Permission]


# Organization Administrator (MASTER 10.1) — full catalog for the demo.
_ORG_ADMIN = DemoRole(
    key="organization_admin",
    label="Organization Administrator",
    role_name="organization_admin",
    permissions=_ALL_PERMISSIONS,
)

# Resource Manager (MASTER 10.2) — people, skills, availability, staffing.
_RESOURCE_MANAGER = DemoRole(
    key="resource_manager",
    label="Resource Manager",
    role_name="resource_manager",
    permissions=frozenset(
        {
            Permission.PROJECTS_VIEW,
            Permission.PEOPLE_VIEW,
            Permission.PEOPLE_EDIT,
            Permission.PEOPLE_SKILLS_MANAGE,
            Permission.PEOPLE_AVAILABILITY_VIEW,
            Permission.PEOPLE_AVAILABILITY_MANAGE,
            Permission.PEOPLE_WORKLOAD_VIEW,
            Permission.TEAM_RECOMMEND,
            Permission.TEAM_ASSIGN,
            Permission.TEAM_REMOVE,
            Permission.TEAM_OVERRIDE_CAPACITY,
            Permission.REPORTS_VIEW,
            Permission.ASSISTANT_USE,
        }
    ),
)

# Project Manager (MASTER 10.3) — owns projects, teams, tickets, feedback.
_PROJECT_MANAGER = DemoRole(
    key="project_manager",
    label="Project Manager",
    role_name="project_manager",
    permissions=frozenset(
        {
            Permission.PROJECTS_CREATE,
            Permission.PROJECTS_VIEW,
            Permission.PROJECTS_EDIT,
            Permission.PROJECTS_ARCHIVE,
            Permission.PROJECTS_CLOSE,
            Permission.PEOPLE_VIEW,
            Permission.PEOPLE_AVAILABILITY_VIEW,
            Permission.PEOPLE_WORKLOAD_VIEW,
            Permission.TEAM_RECOMMEND,
            Permission.TEAM_ASSIGN,
            Permission.TEAM_REMOVE,
            Permission.TICKETS_VIEW,
            Permission.TICKETS_CREATE,
            Permission.TICKETS_EDIT,
            Permission.TICKETS_ASSIGN,
            Permission.TICKETS_TRANSITION,
            Permission.FEEDBACK_CREATE,
            Permission.FEEDBACK_VIEW_SHARED,
            Permission.FEEDBACK_VIEW_PRIVATE,
            Permission.FEEDBACK_EDIT,
            Permission.REPORTS_VIEW,
            Permission.REPORTS_GENERATE,
            Permission.ASSISTANT_USE,
            Permission.ASSISTANT_PROPOSE_ACTIONS,
            Permission.ASSISTANT_APPROVE_ACTIONS,
        }
    ),
)

# Executive Viewer (MASTER 10.6) — aggregated reports, no private feedback.
_EXECUTIVE_VIEWER = DemoRole(
    key="executive_viewer",
    label="Executive Viewer",
    role_name="executive_viewer",
    permissions=frozenset(
        {
            Permission.PROJECTS_VIEW,
            Permission.PEOPLE_WORKLOAD_VIEW,
            Permission.REPORTS_VIEW,
            Permission.ASSISTANT_USE,
        }
    ),
)

# Team Member (MASTER 10.5) — own work, assigned tickets, shared feedback.
_TEAM_MEMBER = DemoRole(
    key="team_member",
    label="Team Member",
    role_name="team_member",
    permissions=frozenset(
        {
            Permission.PROJECTS_VIEW,
            Permission.TICKETS_VIEW,
            Permission.FEEDBACK_VIEW_SHARED,
            Permission.FEEDBACK_ACKNOWLEDGE,
            Permission.ASSISTANT_USE,
        }
    ),
)

DEMO_ROLES: dict[str, DemoRole] = {
    role.key: role
    for role in (
        _ORG_ADMIN,
        _RESOURCE_MANAGER,
        _PROJECT_MANAGER,
        _EXECUTIVE_VIEWER,
        _TEAM_MEMBER,
    )
}

# No selection (and unknown keys) fall back to the full-access admin so the
# default demo experience and existing behavior are unchanged.
DEFAULT_DEMO_ROLE_KEY = _ORG_ADMIN.key


def resolve_demo_role(key: str | None) -> DemoRole:
    """Return the demo role for ``key``, defaulting to the admin role."""
    if key is None:
        return DEMO_ROLES[DEFAULT_DEMO_ROLE_KEY]
    return DEMO_ROLES.get(key, DEMO_ROLES[DEFAULT_DEMO_ROLE_KEY])
