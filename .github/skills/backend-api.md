# Skill: backend-api

**Goal:** Build layered FastAPI features (router → service → repository → model,
plus schemas) that follow the backend standard.

## Use when

Creating or changing anything under [apps/api](../../apps/api): an endpoint,
service, repository, SQLAlchemy model, Pydantic schema, dependency, or error
mapping.

## Read first

* [BACKEND_STANDARDS.md](../../docs/BACKEND_STANDARDS.md) — the binding rules and templates.
* [DATA_MODEL.md](../../docs/DATA_MODEL.md) and [MASTER.md](../../docs/MASTER.md) §20, §21 for entities/data rules.
* [DOMAIN_RULES.md](../../docs/DOMAIN_RULES.md) for the business rules the service must enforce.
* [MASTER.md](../../docs/MASTER.md) §22 (endpoints), §23 (API standards).
* Model/migration work → also use [data-model-migrations](data-model-migrations.md).
* Authorization → also use [rbac-permissions](rbac-permissions.md).

## Steps

1. Keep layering one-directional: `api → services → repositories → models` (§1).
2. Router only maps request/response and wires deps — no business logic (§9).
3. Service holds all domain rules, owns the transaction, checks authorization,
   raises typed domain exceptions (§8, §10).
4. Repository does org-scoped, soft-delete-aware queries only (§7).
5. Separate Pydantic `Create`/`Update`/`Read`; use `version` for optimistic
   concurrency; ISO 8601 timestamps (§6).
6. Paginate/filter/sort list endpoints; idempotency key on writes; correlation
   id on every response (MASTER §23).
7. Add an Alembic migration for any model change (§13).
8. Add tests: unit (rules), integration (endpoint), authorization/isolation (§14).

## Guardrails

* Simplicity first (§0): don't add layers, base classes, or config "just in case."
* Every query scoped by `organization_id`; excludes soft-deleted rows.
* Permissions enforced here, not assumed from the client.
* Fully async; mypy strict; Ruff clean.

## Definition of Done

Use the BACKEND_STANDARDS §16 checklist. Must pass `ruff check .`,
`ruff format --check .`, `mypy app`, `pytest`.
