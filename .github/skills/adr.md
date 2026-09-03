# Skill: adr

**Goal:** Record an Architecture Decision Record before making a change that
deviates from the master, the stack, or a pinned version.

## Use when

Changing the technology stack or a pinned version, altering a documented
requirement or rule, or making any major technical-direction change.

## Read first

* [docs/adr/README.md](../../docs/adr/README.md) — when an ADR is required + naming.
* [docs/adr/0000-template.md](../../docs/adr/0000-template.md) — the template.
* [MASTER.md](../../docs/MASTER.md) §18 (stack), §39 (coding-agent rule 16).

## Steps

1. Copy `0000-template.md` to the next `NNNN-title-in-kebab-case.md`.
2. Fill Context (forces + affected MASTER sections), Decision (the change and how
   it differs from the master), and Consequences (trade-offs + follow-ups).
3. Get the ADR to **Accepted** before writing the code it authorizes.
4. Update the affected docs so they and the ADR stay consistent.

## Guardrails

* No stack/version/requirement change ships without an accepted ADR.
* The master remains the source of truth; the ADR records the sanctioned exception.

## Definition of Done

ADR added, sequentially numbered, Accepted, and cross-referenced from the docs it changes.
