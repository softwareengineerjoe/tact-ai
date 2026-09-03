# RBAC and Privacy

**Status:** Companion document. Derived from [MASTER.md](MASTER.md).

The single source of truth is [MASTER.md](MASTER.md). When anything here conflicts
with the master, the master wins unless an approved ADR changes it.

## Roles

See MASTER section 10 for the full definitions:

* Organization Administrator
* Resource Manager
* Project Manager
* Team Lead or Reviewer
* Team Member
* Executive Viewer
* HR or People Partner
* Auditor

## Permissions

The discrete permissions listed in MASTER section 11 must be implemented
separately (for example: `projects.create`, `team.assign`,
`feedback.view_private`, `assistant.approve_actions`).

## Core Privacy and Access Rules

* The AI assistant inherits the current user's permissions and can never exceed them.
* Enforce permissions in the backend, not only in the UI.
* Apply field-level access to sensitive information.
* Isolate every organization's records.
* Private feedback is excluded from general search and document retrieval.
* Access to private feedback must be audited.
* Preserve document access restrictions during AI retrieval.
* Prevent prompt injection from bypassing tool permissions.

See MASTER sections 11 and 28 for the complete lists.

## Standardized RBAC Code Patterns

RBAC is implemented with a single, shared permission catalog and consistent
primitives on both sides:

* Frontend: permission catalog, `useHasPermission` hooks, `RequirePermission`
  route guard, and `PermissionGate` action gate — see
  [FRONTEND_STANDARDS.md](FRONTEND_STANDARDS.md) section 7A.
* Backend: `Permission` enum, `Principal` with `require` / `require_any` /
  `require_all` / `require_on_project`, router `require_permission(...)` guard,
  field-level access, and audit — see
  [BACKEND_STANDARDS.md](BACKEND_STANDARDS.md) section 11.

The backend is always the authority. The frontend permission catalog mirrors the
backend one; both mirror MASTER section 11.
