"""The authorization subject passed into every service (BACKEND_STANDARDS 11.2)."""

import uuid
from collections.abc import Iterable
from dataclasses import dataclass, field

from app.core.exceptions import PermissionDenied
from app.security.permissions import Permission


@dataclass(frozen=True, slots=True)
class Principal:
    user_id: uuid.UUID
    organization_id: uuid.UUID
    roles: frozenset[str]
    permissions: frozenset[Permission]
    # Project-scoped grants: project_id -> permissions valid only on that project.
    project_permissions: dict[uuid.UUID, frozenset[Permission]] = field(default_factory=dict)

    def has(self, permission: Permission) -> bool:
        return permission in self.permissions

    def require(self, permission: Permission) -> None:
        if permission not in self.permissions:
            raise PermissionDenied(f"Missing permission: {permission}")

    def require_any(self, permissions: Iterable[Permission]) -> None:
        if not any(p in self.permissions for p in permissions):
            raise PermissionDenied("Missing all of the required permissions")

    def require_all(self, permissions: Iterable[Permission]) -> None:
        missing = [p for p in permissions if p not in self.permissions]
        if missing:
            raise PermissionDenied(f"Missing permissions: {', '.join(missing)}")

    def require_on_project(self, project_id: uuid.UUID, permission: Permission) -> None:
        """Authoritative for project-scoped access (MASTER 10.3, 28)."""
        if permission in self.permissions:
            return
        if permission in self.project_permissions.get(project_id, frozenset()):
            return
        raise PermissionDenied(f"Missing project permission: {permission}")
