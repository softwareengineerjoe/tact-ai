"""Single permission catalog — mirrors MASTER section 11 and the frontend
``types/permissions.ts``. Never inline permission strings elsewhere."""

from enum import StrEnum


class Permission(StrEnum):
    ORGANIZATION_MANAGE = "organization.manage"
    USERS_MANAGE = "users.manage"
    ROLES_MANAGE = "roles.manage"
    INTEGRATIONS_MANAGE = "integrations.manage"
    AUDIT_VIEW = "audit.view"

    PROJECTS_CREATE = "projects.create"
    PROJECTS_VIEW = "projects.view"
    PROJECTS_EDIT = "projects.edit"
    PROJECTS_ARCHIVE = "projects.archive"
    PROJECTS_CLOSE = "projects.close"

    PEOPLE_VIEW = "people.view"
    PEOPLE_EDIT = "people.edit"
    PEOPLE_SKILLS_MANAGE = "people.skills.manage"
    PEOPLE_AVAILABILITY_VIEW = "people.availability.view"
    PEOPLE_AVAILABILITY_MANAGE = "people.availability.manage"
    PEOPLE_WORKLOAD_VIEW = "people.workload.view"

    TEAM_RECOMMEND = "team.recommend"
    TEAM_ASSIGN = "team.assign"
    TEAM_REMOVE = "team.remove"
    TEAM_OVERRIDE_CAPACITY = "team.override_capacity"

    TICKETS_VIEW = "tickets.view"
    TICKETS_CREATE = "tickets.create"
    TICKETS_EDIT = "tickets.edit"
    TICKETS_ASSIGN = "tickets.assign"
    TICKETS_TRANSITION = "tickets.transition"

    FEEDBACK_CREATE = "feedback.create"
    FEEDBACK_VIEW_SHARED = "feedback.view_shared"
    FEEDBACK_VIEW_PRIVATE = "feedback.view_private"
    FEEDBACK_EDIT = "feedback.edit"
    FEEDBACK_ACKNOWLEDGE = "feedback.acknowledge"

    REPORTS_VIEW = "reports.view"
    REPORTS_GENERATE = "reports.generate"

    ASSISTANT_USE = "assistant.use"
    ASSISTANT_PROPOSE_ACTIONS = "assistant.propose_actions"
    ASSISTANT_APPROVE_ACTIONS = "assistant.approve_actions"
