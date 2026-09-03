# Operations

**Status:** Companion document. Derived from [MASTER.md](MASTER.md).

The single source of truth is [MASTER.md](MASTER.md). When anything here conflicts
with the master, the master wins unless an approved ADR changes it.

## Technology Stack

See MASTER section 18 (frontend, backend, data/storage, AI, auth/security,
Azure hosting). Versions must be pinned in the repository.

## Architecture

See MASTER section 17 for the component diagram.

## Non-Functional Requirements

See MASTER section 29:

* Performance targets (API p95 < 500 ms, dashboard < 2 s, AI first response < 5 s).
* Reliability (integration failures must not disable native features; idempotent webhooks; automated, tested backups).
* Observability (API errors, latency, DB, AI/token usage, tool-call failures, integration health, job status).
* Scalability (100–1,000 users, 10–100 active projects, 10,000+ tickets).

## Release Phases

See MASTER section 30 (Phase 0 → Phase 4) and the development order in section 34.

## Quality Checks

Frontend: `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm playwright test`.
Backend: `ruff check .`, `ruff format --check .`, `mypy app`, `pytest`.
See MASTER section 33 for pull-request requirements.

## Coding Standards

All code must follow the binding coding standards:

* Frontend: [FRONTEND_STANDARDS.md](FRONTEND_STANDARDS.md)
* Backend: [BACKEND_STANDARDS.md](BACKEND_STANDARDS.md)

These define the mandatory folder structure, naming, and copy-ready templates
for every component, page, hook, store, service, route, model, schema,
repository, and endpoint. The coding agent enforces them via
[.github/copilot-instructions.md](../.github/copilot-instructions.md).
