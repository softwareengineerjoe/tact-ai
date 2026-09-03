# TACT AI — Skills Orchestrator

**Status:** Binding. This is the entry point the coding agent uses to pick the
right **skill** and automatically read the right **documentation** before doing
any work. It complements [copilot-instructions.md](../copilot-instructions.md).

Source of truth is always [docs/MASTER.md](../../docs/MASTER.md). When a skill or
doc conflicts with the master, the master wins unless an approved ADR changes it.

---

## How the orchestrator works

For every task, follow this protocol **before writing code or prose**:

1. **Classify the request** using the routing table below (match on intent /
   keywords / files touched). A task may match more than one skill.
2. **Load the skill file(s)** for the matched rows.
3. **Read the docs each skill lists under "Read first"** — only those, not the
   whole doc set. Always include [MASTER.md](../../docs/MASTER.md) when the task
   changes product behavior, data, permissions, or the stack.
4. **Apply the skill's steps, guardrails, and Definition of Done.**
5. If the task changes a requirement, the stack, or a pinned version, invoke the
   **adr** skill first (no code until the ADR exists).
6. If the request is ambiguous or spans phases, confirm scope against
   [MASTER.md section 30](../../docs/MASTER.md) (release phases) before starting.

Keep it lean (per section 0 of the standards): load the **minimum** docs needed,
prefer the simplest compliant approach, and do not pull in skills a task does
not need.

---

## Deviation protocol (binding)

The documentation is the contract. If a task fits the documented approach,
implement it directly. If you believe a **different, undocumented, or
conflicting** approach is warranted:

1. **Do not develop yet.** Pause before writing or changing code.
2. **Ask for confirmation**, stating what the docs require, the proposed
   alternative, why it is better, and which documents it affects.
3. **Proceed only after explicit approval.**
4. **After building, update the affected document(s)** so docs and code stay in
   sync; route through the [adr](adr.md) skill when the change touches the stack,
   a pinned version, or a documented requirement/rule.

Never deviate silently. Never leave an approved deviation undocumented.

---

## Routing table (intent → skill → read first)

| If the task is about…                                                       | Use skill | Read first (docs) |
| --------------------------------------------------------------------------- | --------- | ----------------- |
| React component, page, container, form, route, hook, store, UI state        | [frontend-ui](frontend-ui.md) | FRONTEND_STANDARDS; DESIGN_GUIDELINES; UX_FLOWS |
| FastAPI endpoint, service, repository, model, schema, error handling         | [backend-api](backend-api.md) | BACKEND_STANDARDS; DATA_MODEL; DOMAIN_RULES |
| Permissions, roles, guards, field-level access, authorization, org isolation | [rbac-permissions](rbac-permissions.md) | RBAC_AND_PRIVACY; MASTER §11, §28 |
| DB tables, entities, relationships, Alembic migrations, soft delete          | [data-model-migrations](data-model-migrations.md) | DATA_MODEL; MASTER §20, §21; BACKEND_STANDARDS §5, §13 |
| AI assistant, orchestrator agent, tools, action proposals, chat sessions     | [ai-assistant](ai-assistant.md) | AI_SYSTEM; MASTER §15; RBAC_AND_PRIVACY |
| Excel/Jira/Workday/DevOps/Teams/SharePoint adapters, sync, webhooks          | [integrations](integrations.md) | INTEGRATIONS; MASTER §12, §13, §16 |
| Team recommendations, Project Fit Score, capacity, availability, staffing     | [recommendations-capacity](recommendations-capacity.md) | DOMAIN_RULES; MASTER FR-006, FR-007, FR-008, FR-009 |
| Tests, coverage, mandatory scenarios, authorization/isolation tests          | [testing](testing.md) | TEST_STRATEGY; MASTER §32; FRONTEND/BACKEND_STANDARDS |
| Colors, tokens, typography, spacing, visual polish, look & feel              | [design-system](design-system.md) | DESIGN_GUIDELINES; FRONTEND_STANDARDS §13A, §15 |
| Scope, phase, requirement, "should we build X", feature boundaries           | [product-scope](product-scope.md) | MASTER §1–§14, §30, §35 |
| Deployment, Docker/Bicep, CI/CD, quality gates, observability, health, backups | [operations](operations.md) | OPERATIONS; MASTER §17, §18, §29, §33 |
| Changing a requirement, the stack, a pinned version, or major direction      | [adr](adr.md) | docs/adr/README; MASTER §39 (rule 16) |

If nothing matches, default to [product-scope](product-scope.md) to clarify the
requirement, then re-route.

---

## Cross-cutting guardrails (apply to every skill)

* **Simplicity first** — smallest compliant solution; no overengineering
  (FRONTEND/BACKEND_STANDARDS section 0).
* **Backend is the authority** for permissions; the UI only reflects them.
* **Every query** is org-scoped and excludes soft-deleted rows.
* **The AI layer never touches the DB directly** and never executes an unapproved write.
* **Deterministic** Project Fit Score in a service; the model only explains it.
* **Preserve** revision/audit history; soft-delete business records.
* **Never** use protected characteristics or private feedback in scoring.

---

## Skill catalog

| Skill | Purpose |
| ----- | ------- |
| [frontend-ui](frontend-ui.md) | Build React UI to the frontend standard + design system |
| [backend-api](backend-api.md) | Build layered FastAPI features to the backend standard |
| [rbac-permissions](rbac-permissions.md) | Implement authorization consistently on both sides |
| [data-model-migrations](data-model-migrations.md) | Model entities and write Alembic migrations |
| [ai-assistant](ai-assistant.md) | Build the orchestrator agent, tools, and action proposals |
| [integrations](integrations.md) | Build optional provider adapters safely |
| [recommendations-capacity](recommendations-capacity.md) | Deterministic scoring, capacity, staffing |
| [testing](testing.md) | Author tests incl. mandatory scenarios |
| [design-system](design-system.md) | Apply brand tokens and visual rules |
| [product-scope](product-scope.md) | Interpret requirements, scope, and phases |
| [operations](operations.md) | Deployment, CI/CD, quality gates, observability |
| [adr](adr.md) | Record architecture decisions |
