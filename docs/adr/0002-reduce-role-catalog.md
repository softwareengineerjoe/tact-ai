# 0002. Reduce the documented role catalog from eight roles to five

* **Status:** Accepted
* **Date:** 2026-09-14
* **Deciders:** TACT AI engineering
* **Related requirement(s):** MASTER §10 (User Roles and Permissions), §11
  (Permission Rules), §30 (Phase 0/1); FR-001

## Context

MASTER §10 defines **eight** user roles: Organization Administrator, Resource
Manager, Project Manager, Team Lead or Reviewer, Team Member, Executive Viewer,
HR or People Partner, and Auditor.

The implemented product (the MVP demo role selector in
[demo_roles.py](../../apps/api/app/security/demo_roles.py) and its frontend
mirror in [demoRole.ts](../../apps/web/src/app/auth/demoRole.ts)) ships **five**
roles: Organization Administrator, Resource Manager, Project Manager, Executive
Viewer, and Team Member. Three documented roles — **Team Lead or Reviewer**,
**HR or People Partner**, and **Auditor** — are not implemented.

This creates a documentation/implementation gap: the master promises more roles
than the product delivers, which makes the role model look more complex than it
is and prompts the reasonable question "why do we have so many roles?" For the
current phase (MASTER §30, a simple standalone app on synthetic data), the five
implemented roles already cover every distinct persona with a genuinely
different permission bundle. The three missing roles are refinements of existing
ones:

* **Team Lead or Reviewer** is a narrower Project Manager / Team Member scoped to
  a single project.
* **HR or People Partner** is a conditional, authorization-gated view of private
  feedback rather than a day-to-day role.
* **Auditor** is a read-only view over audit logs (MASTER §11 `audit.view`),
  meaningful only once full audit logging ships (Phase 2+).

The discrete **permission catalog** in MASTER §11 is unchanged by this decision —
it remains the authoritative, fine-grained source of truth, and roles are simply
bundles of those permissions.

## Decision

Reduce the documented role catalog to the **five** roles that are actually
implemented for the current phase:

1. Organization Administrator
2. Resource Manager
3. Project Manager
4. Executive Viewer
5. Team Member

Team Lead or Reviewer, HR or People Partner, and Auditor are **deferred** to a
later phase rather than removed as concepts. When they are implemented, their
capabilities are expressed as subsets/combinations of the existing §11
permissions (for example project-scoped grants for Team Lead, `feedback.view_
private` for HR Partner, `audit.view` for Auditor), so no new permission
primitives are required to reintroduce them.

The §11 permission catalog and the RBAC enforcement mechanics (backend
`Permission` enum, `Principal`, router guards, field-level access) are unchanged.

## Consequences

* Positive:
  * Documentation matches the shipped product; the role model reads as simple
    and intentional.
  * Directly answers the "too many roles?" concern without weakening access
    control — every remaining role has a distinct, real permission set.
  * No code change required; the app already ships exactly these five roles.
* Negative / trade-offs:
  * Personas that map to Team Lead, HR Partner, or Auditor must temporarily use
    the nearest existing role until those roles are reintroduced.
  * A future phase must re-add the three deferred roles (and, for Auditor, the
    audit-log surface) with their own ADR/PR if requirements demand them.
* Follow-up actions (docs to update, migrations, tests):
  * Update MASTER §10 to list the five current roles and note the three deferred
    roles and the phase in which they return.
  * Update [RBAC_AND_PRIVACY.md](../RBAC_AND_PRIVACY.md) roles list to match.
  * No migration; no permission-catalog change.
  * The in-app Roles reference page
    ([RolesReferencePage.tsx](../../apps/web/src/pages/RolesReferencePage.tsx))
    already documents these five roles for end users.
