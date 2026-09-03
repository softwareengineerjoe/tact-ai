# Skill: rbac-permissions

**Goal:** Implement authorization consistently on both sides using the shared
permission catalog and primitives.

## Use when

Any task that reads/writes protected data, adds a route or action, exposes a
sensitive field, or touches roles, permissions, org isolation, or audit.

## Read first

* [RBAC_AND_PRIVACY.md](../../docs/RBAC_AND_PRIVACY.md) — roles, permissions, privacy rules.
* [MASTER.md](../../docs/MASTER.md) §10 (roles), §11 (permissions), §28 (security).
* [FRONTEND_STANDARDS.md](../../docs/FRONTEND_STANDARDS.md) §7A (frontend RBAC).
* [BACKEND_STANDARDS.md](../../docs/BACKEND_STANDARDS.md) §11 (backend RBAC).

## Steps

1. Use the single permission catalog — frontend `types/permissions.ts`, backend
   `security/permissions.py`. Never inline permission strings.
2. Frontend: guard routes with `RequirePermission`; gate mutating actions and
   sensitive fields with `PermissionGate`; a `403` renders `ForbiddenState`.
3. Backend: add the router `require_permission(...)` guard **and** the
   authoritative `principal.require(...)`/`require_on_project(...)` in the service.
4. Strip unauthorized fields in the service/schema layer (field-level access).
5. Audit private-feedback reads and all writes in the same transaction.
6. AI tools pass the caller's `Principal` unchanged — never widen scope.
7. Test both authorized and unauthorized paths (front + back), plus org isolation.

## Guardrails

* The backend is the sole authority; UI gating is UX only.
* The AI never exceeds the caller's permissions.
* Private feedback and protected characteristics never affect scoring.

## Definition of Done

Permissions sourced from the catalog; route guarded + action gated + service
re-checks; field-level access enforced; sensitive access audited; authz tests
pass (MASTER §32 scenarios covered).
