# Skill: product-scope

**Goal:** Interpret requirements, feature boundaries, and release phases so work
targets the right scope and does not overbuild.

## Use when

The request is ambiguous, asks "should we build X", spans multiple areas, or
needs a decision about what belongs in the current phase.

## Read first

* [MASTER.md](../../docs/MASTER.md) §1–§14 (overview, boundaries, roles,
  functional requirements), §30 (release phases), §35 (MVP definition of done).
* [PRODUCT_REQUIREMENTS.md](../../docs/PRODUCT_REQUIREMENTS.md) — FR index.
* [UX_FLOWS.md](../../docs/UX_FLOWS.md) — the user journey and screens.

## Steps

1. Identify the functional requirement(s) (FR-001…FR-020) the request maps to.
2. Confirm the active release phase; implement only the current phase unless told
   otherwise (MASTER §30, §39 rule 2).
3. Respect product boundaries (MASTER §7) and principles (§8) — standalone-first,
   human-controlled AI, privacy by design, no hidden ranking.
4. Break the request into the smallest set of tasks and route each to the right
   skill via the [orchestrator](orchestrator.md).
5. Flag anything that is future-phase or out of scope instead of building it.

## Guardrails

* Simplicity first: deliver the current requirement, not an imagined future one.
* Keep integrations optional; use feature flags for incomplete optional features.
* Do not implement future-phase features in a way that delays the current phase.

## Definition of Done

The task is mapped to concrete FRs and the correct phase, split into routed
subtasks, with any out-of-scope items called out.
