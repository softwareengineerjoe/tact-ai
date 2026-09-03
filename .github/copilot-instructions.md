# TACT AI — Copilot / Coding Agent Instructions

These instructions apply to all code generated in this workspace.

## Start Here: Skills Orchestrator (MANDATORY)

- Before starting any task, consult [.github/skills/orchestrator.md](skills/orchestrator.md).
- The orchestrator routes each request to the right skill in [.github/skills](skills)
  and lists the exact docs to read for that scenario. Load only those docs.
- Available skills: frontend-ui, backend-api, rbac-permissions,
  data-model-migrations, testing, design-system, ai-assistant, integrations,
  recommendations-capacity, product-scope, operations, adr.
- Follow the routed skill's "Read first", Steps, Guardrails, and Definition of Done.

## Source of Truth

- [docs/MASTER.md](../docs/MASTER.md) is the product and architecture source of truth.
- When implementation conflicts with the master, the master wins unless an
  approved ADR in [docs/adr](../docs/adr) changes it.

## Coding Standards (MANDATORY)

Before writing or changing code, follow the applicable standard:

- Frontend (React / TypeScript, `apps/web`): [docs/FRONTEND_STANDARDS.md](../docs/FRONTEND_STANDARDS.md)
- Backend (FastAPI / Python, `apps/api`): [docs/BACKEND_STANDARDS.md](../docs/BACKEND_STANDARDS.md)
- UI / visual design (all `apps/web` UI): [docs/DESIGN_GUIDELINES.md](../docs/DESIGN_GUIDELINES.md)

Whenever you create a component, page, hook, store, service, route, model,
schema, repository, endpoint, or migration, use the exact templates, naming,
and folder conventions defined in those documents.

## Documentation Is Binding — Deviation Protocol (MANDATORY)

The documentation is the contract. Follow it strictly. When a task can be done
within the documented approach, do it that way without asking.

If you believe a **different, undocumented, or conflicting approach** is needed
(a new pattern, a stack/version change, a deviation from a template, rule, or
requirement), you MUST:

1. **Stop before developing.** Do not write or change code for the deviation yet.
2. **Ask for confirmation first.** Explain what the docs currently require, the
   proposed alternative, why it is better, and which documents it affects.
3. **Wait for the user's explicit approval.** Proceed only after they confirm.
4. **After building the approved change, update the affected document(s)** so the
   docs and code stay consistent — and, when the change alters the stack, a
   pinned version, or a documented requirement/rule, add an ADR
   ([docs/adr](../docs/adr)) as well (see Hard Rule 12).

Never silently deviate from the documentation. Never leave an approved deviation
undocumented.

UI must be clean, minimalist, and premium, using the Starbucks-inspired brand
tokens in DESIGN_GUIDELINES.md. Use semantic token classes only (`bg-primary`,
`text-fg-muted`, `border-border`) — never raw hex or palette steps in components.
One `h1` and one primary action per view; pair status color with an icon/label;
meet WCAG 2.2 AA. Do not use trademarked Starbucks assets (logo, siren).

RBAC is standardized and mandatory. Use the shared permission catalog and
primitives: frontend `types/permissions.ts`, `useHasPermission`,
`RequirePermission`, and `PermissionGate` (FRONTEND_STANDARDS section 7A);
backend `security/permissions.py` `Permission` enum, `Principal.require(...)`,
the router `require_permission(...)` guard, field-level access, and audit
(BACKEND_STANDARDS section 11). Never inline permission strings. Guard routes
**and** gate mutating actions, and always re-check authorization in the service.

## Hard Rules (never violate)

0. Simplicity first: write the smallest, clearest solution that meets the
   requirement (FRONTEND/BACKEND_STANDARDS section 0). Prefer less code and fewer
   abstractions; no speculative options, layers, or generality (YAGNI). When two
   compliant approaches exist, pick the simpler one. Do not overengineer.
1. TypeScript strict; no `any`. Named exports only for components/hooks/services.
2. TanStack Query owns server state; Zustand holds UI state only.
3. Every page renders loading, empty, error, and success states. Use the shared
   lifecycle state components in FRONTEND_STANDARDS section 13A (LoadingState,
   EmptyState, ErrorState, ForbiddenState, OfflineState, PartialDataNotice,
   ConfirmDialog, toast) — never a bare spinner, blank node, or raw error text.
   Mutations must resolve to a visible success or error; destructive/high-impact
   actions confirm via ConfirmDialog first.
4. Backend layering is one-directional: `api → services → repositories → models`.
5. Routers contain no business logic; services hold all domain rules.
6. Every DB query is scoped by `organization_id` and excludes soft-deleted rows.
7. Permissions are enforced in the backend; the AI inherits the caller's permissions.
8. The AI layer never accesses the database directly and never executes writes
   without a human-approved, immutable action proposal.
9. Project Fit Score is computed deterministically in a service; the model only explains it.
10. Never use protected characteristics or private feedback in recommendation scoring.
11. Preserve revision/audit history; use soft deletion for business records.
12. Do not change the technology stack or a pinned version without an ADR.
13. Documentation is binding: never deviate from it silently. Propose any
    undocumented/conflicting approach, get explicit confirmation before building,
    then update the affected document(s) after (see Deviation Protocol above).

## Quality Gates

- Frontend: `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm playwright test`.
- Backend: `ruff check .`, `ruff format --check .`, `mypy app`, `pytest`.

All relevant gates must pass. Add tests for critical workflows, including the
mandatory scenarios in [docs/MASTER.md](../docs/MASTER.md) section 32.
