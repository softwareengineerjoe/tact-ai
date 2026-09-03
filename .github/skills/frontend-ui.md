# Skill: frontend-ui

**Goal:** Build React UI (components, pages, containers, forms, routes, hooks,
stores, UI state) that follows the frontend standard and the design system.

## Use when

Creating or changing anything under [apps/web](../../apps/web): a component,
page, container, form, route, TanStack Query hook, Zustand store, or any UI state
(loading/empty/error/forbidden/offline/success) or interaction lifecycle.

## Read first

* [FRONTEND_STANDARDS.md](../../docs/FRONTEND_STANDARDS.md) — the binding rules and templates.
* [DESIGN_GUIDELINES.md](../../docs/DESIGN_GUIDELINES.md) — tokens, typography, components.
* [UX_FLOWS.md](../../docs/UX_FLOWS.md) — routes and screens (mirrors MASTER §24, §25).
* [MASTER.md](../../docs/MASTER.md) §24 (routes), §25 (screens) when adding a page.
* If the surface has permissions → also use the [rbac-permissions](rbac-permissions.md) skill.

## Steps

1. Pick the artifact and its folder/naming from FRONTEND_STANDARDS §2, §3.
2. Presentational vs container (§5); pages compose containers only (§6).
3. Server state via TanStack Query with a typed key factory (§8); UI state in
   Zustand only (§12). Never duplicate server data into Zustand.
4. Validate all I/O with Zod at the boundary; infer types from schemas (§9, §10).
5. Render every lifecycle state with the shared components in §13A
   (LoadingState/EmptyState/ErrorState/ForbiddenState/OfflineState/PartialDataNotice;
   mutations → toast success/error; destructive → ConfirmDialog).
6. Guard routes and gate mutating actions with permissions (§7, §7A).
7. Style with semantic token classes only (DESIGN_GUIDELINES §9) — no raw hex.
8. Add unit/component tests (§14); E2E for MASTER §32 UI scenarios.

## Guardrails

* Simplicity first (§0): smallest component tree, no premature abstraction.
* TypeScript strict; no `any`; named exports only.
* No business logic in components/pages — put it in hooks/services/utils.
* One `h1` and one primary action per view; WCAG 2.2 AA.

## Definition of Done

Use the FRONTEND_STANDARDS §16 checklist. Must pass `pnpm lint`, `pnpm test`,
`pnpm build`, and Playwright where required.
