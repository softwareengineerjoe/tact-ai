# Skill: data-model-migrations

**Goal:** Model entities and evolve the schema with reviewed Alembic migrations.

## Use when

Adding or changing a table/entity, relationship, index, enum, or any DB schema;
writing or reviewing an Alembic migration.

## Read first

* [DATA_MODEL.md](../../docs/DATA_MODEL.md) — entity groups and data rules.
* [MASTER.md](../../docs/MASTER.md) §20 (core data model), §21 (data rules).
* [BACKEND_STANDARDS.md](../../docs/BACKEND_STANDARDS.md) §5 (models), §13 (migrations).

## Steps

1. Use the shared `Base` (UUID PK, UTC `created_at`/`updated_at`, `version`,
   `deleted_at`). Typed `Mapped[...]`/`mapped_column`.
2. Add `organization_id` (+ index) to every org-scoped table.
3. Define enums once (core/enums) and reuse in schemas — no duplicated value lists.
4. Use DB constraints for required relationships; retain provider/external ids
   on integrated records; record model+prompt version on AI-generated rows.
5. Ship one Alembic migration per model change; never edit an applied migration.
6. Provide a tested downgrade for dev; note migration impact in the PR.

## Guardrails

* Simplicity first: model what the current requirement needs, nothing speculative.
* Soft delete only for business records — no physical deletes of projects,
  feedback, assignments, or audit rows.
* UUIDs for identifiers; timestamps in UTC.

## Definition of Done

Model follows §5; migration added, reversible in dev, and noted in the PR;
queries that use the table remain org-scoped and soft-delete-aware.
