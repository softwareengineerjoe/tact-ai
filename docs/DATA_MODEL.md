# Data Model

**Status:** Companion document. Derived from [MASTER.md](MASTER.md).

The single source of truth is [MASTER.md](MASTER.md). When anything here conflicts
with the master, the master wins unless an approved ADR changes it.

## Entity Groups

See MASTER section 20 for the authoritative entity list.

* Organization and Access
* Skills and Capacity
* Projects and Staffing
* Recommendations
* Tickets
* Feedback
* AI
* Documents
* Integrations
* Platform Operations

## Data Rules

See MASTER section 21. Highlights:

* UUID primary identifiers.
* Timestamps stored in UTC; displayed in the user's time zone.
* Version numbers for optimistic concurrency.
* Soft deletion for auditable business records.
* Every query scoped by organization and permission.
* External records retain provider and external identifiers.
* AI-generated records identify the model and prompt version used.
