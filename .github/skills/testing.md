# Skill: testing

**Goal:** Author tests that prove behavior, authorization, and the mandatory
scenarios — on both frontend and backend.

## Use when

Writing or updating any test, or completing a feature that needs coverage.

## Read first

* [TEST_STRATEGY.md](../../docs/TEST_STRATEGY.md) — categories and mandatory scenarios.
* [MASTER.md](../../docs/MASTER.md) §32 (testing strategy + mandatory scenarios).
* [FRONTEND_STANDARDS.md](../../docs/FRONTEND_STANDARDS.md) §14 or
  [BACKEND_STANDARDS.md](../../docs/BACKEND_STANDARDS.md) §14 for the layer.

## Steps

1. Frontend: Vitest + React Testing Library; query by role/label. Cover container
   states (loading/empty/error/success), forbidden/offline, and mutation
   success/error. E2E (Playwright) for MASTER §32 UI scenarios.
2. Backend: async pytest with a transactional session fixture. Cover services
   (rules/scoring/capacity), repositories (real Postgres), endpoints, and
   authorization/org-isolation/field-level access.
3. Always cover the applicable MASTER §32 mandatory scenarios (unauthorized
   feedback, AI cannot read unauthorized data, expired/immutable action proposal,
   webhook idempotency, capacity override, unknown availability, protected data
   not in scoring, integration failure isolation, project-close capacity release,
   concurrency conflicts).
4. Arrange–Act–Assert; one behavior per test; test behavior not implementation.

## Guardrails

* Simplicity first: focused tests, minimal fixtures, no elaborate test frameworks.
* A feature is not done until its critical-path and authz tests exist.

## Definition of Done

Relevant MASTER §32 scenarios covered; frontend and/or backend quality gates pass.
