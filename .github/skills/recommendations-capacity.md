# Skill: recommendations-capacity

**Goal:** Implement deterministic team recommendations, the Project Fit Score,
and date-based capacity/availability — with the model only ever explaining, never
computing, the score.

## Use when

Working on the recommendation engine, fit scoring, candidate comparison,
eligibility rules, capacity/availability calculations, reservations, or
assignment lifecycle.

## Read first

* [DOMAIN_RULES.md](../../docs/DOMAIN_RULES.md) — invariants for scoring and capacity.
* [MASTER.md](../../docs/MASTER.md) FR-006 (capacity), FR-007 (team builder),
  FR-008 (assignment lifecycle), FR-009 (recommendation engine).
* [BACKEND_STANDARDS.md](../../docs/BACKEND_STANDARDS.md) §8 (deterministic scoring in services).

## Steps

1. Apply hard eligibility rules **before** scoring (active status, available in
   period, remaining capacity, permitted, role/skill match, no unresolved conflict).
2. Compute the Project Fit Score deterministically in a service using the exact
   weights: required skills 40, availability/capacity 30, relevant experience 15,
   preferred skills 10, timezone/schedule 5.
3. Compute capacity as: base − approved leave − confirmed allocations − selected
   tentative reservations. Treat Unknown availability as NOT available.
4. Output matched/missing skills, remaining capacity, data freshness, warnings,
   and a reason (MASTER FR-009 shape).
5. Enforce the assignment lifecycle and rules (reservation expiry, start/end
   dates, capacity update, overallocation warning + permission + override reason).
6. Closing a project releases future allocations.

## Guardrails

* The LLM explains the score; it must never calculate or invent it.
* Never use protected characteristics, private feedback, or formal ratings in scoring.
* Call it "Project Fit Score" — never a success/performance score.
* No hidden employee ranking; no promotion/termination/compensation output.

## Definition of Done

Scoring is deterministic and unit-tested with the fixed weights; capacity math
tested including Unknown and overallocation; MASTER §32 scoring/capacity scenarios pass.
