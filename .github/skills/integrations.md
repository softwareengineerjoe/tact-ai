# Skill: integrations

**Goal:** Build optional provider adapters (Excel, Jira, Workday, GitHub, Azure
DevOps, Teams, SharePoint) without coupling the core app to any provider.

## Use when

Adding or changing an integration adapter, sync job, field mapping, webhook, or
conflict handling.

## Read first

* [INTEGRATIONS.md](../../docs/INTEGRATIONS.md) — principles, modes, providers, conflict handling.
* [MASTER.md](../../docs/MASTER.md) §12 (source-of-truth), §13 (ticket modes), §16 (integrations).
* [BACKEND_STANDARDS.md](../../docs/BACKEND_STANDARDS.md) for the service/adapter layering.

## Steps

1. Implement each provider behind an adapter interface; core services depend on
   the interface, never on a provider SDK directly.
2. Respect source-of-truth ownership (MASTER §12); a project has exactly one
   ticket owner (NATIVE/JIRA/AZURE_DEVOPS).
3. Define every field in MASTER §16.8 (auth, mode, mapping, retry, rate-limit,
   conflict policy, webhook validation, health, last error).
4. Make sync incremental and resumable; authenticate and deduplicate webhooks.
5. On conflict: detect revision mismatch, mark conflicted, show both versions,
   apply the configured rule or request manual resolution, record the decision.
6. Keep integrations optional and behind feature flags.

## Guardrails

* Native features must keep working when an integration fails.
* External data must never silently overwrite newer internal data.
* Do not implement a future-phase integration in a way that delays the current phase.

## Definition of Done

Adapter is provider-isolated and optional; conflict + idempotency handled;
integration-contract and webhook-replay tests pass (MASTER §32).
