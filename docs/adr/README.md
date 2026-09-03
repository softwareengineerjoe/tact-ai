# Architecture Decision Records (ADRs)

This folder holds Architecture Decision Records for TACT AI.

Per [MASTER.md](../MASTER.md), the master document is the source of truth.
When a decision needs to change a requirement, technology choice, or major
technical direction defined in the master, record it here as an approved ADR.

## When an ADR Is Required

* Changing the runtime or a pinned technology-stack version (MASTER section 18).
* Any major technical direction change (MASTER Coding Agent Rule 16).
* Deviating from a requirement or rule stated in the master.

## Naming

Use zero-padded sequential filenames:

```text
0001-title-in-kebab-case.md
0002-another-decision.md
```

## Template

Copy [0000-template.md](0000-template.md) to start a new ADR.
