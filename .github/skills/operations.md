# Skill: operations

**Goal:** Handle deployment, infrastructure, CI/CD, quality gates, observability,
and non-functional requirements without weakening the product standards.

## Use when

Working on Docker/Compose, Azure hosting/Bicep, CI/CD pipelines, environment
config/secrets, health checks, monitoring/observability, performance/reliability
targets, backups, or the quality-gate commands.

## Read first

* [OPERATIONS.md](../../docs/OPERATIONS.md) — stack, NFRs, phases, quality checks.
* [MASTER.md](../../docs/MASTER.md) §17 (architecture), §18 (stack + pinned
  versions), §29 (non-functional requirements), §30/§34 (phases + order), §33
  (quality checks + PR requirements).

## Steps

1. Keep pinned versions from MASTER §18; any version/stack change needs an ADR
   (route to the [adr](adr.md) skill first).
2. Read config from env / Azure Key Vault; never hardcode secrets or model
   deployment names (MASTER §18.4, §28).
3. Wire the quality gates exactly: frontend `pnpm lint`/`test`/`build`/
   `playwright test`; backend `ruff check .`/`ruff format --check .`/`mypy app`/
   `pytest` (MASTER §33).
4. Expose `/health/live` and `/health/ready`; use background jobs for
   long-running work (MASTER §22, §29).
5. Add observability for API errors, latency, DB, AI/token usage, tool-call
   failures, integration health, and job status (MASTER §29).
6. Ensure integration failures never disable native features; webhooks are
   idempotent; backups are automated and restore-tested.

## Guardrails

* Simplicity first: the smallest infra that meets the current phase — no
  speculative services.
* Implement only the active phase (MASTER §30); do not let future-phase infra
  delay the current one.
* Do not change the stack or a pinned version without an approved ADR.

## Definition of Done

Quality gates run in CI and pass; health checks and required observability exist;
secrets/config externalized; phase-appropriate infra only; version changes carry an ADR.
