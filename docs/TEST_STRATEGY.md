# Test Strategy

**Status:** Companion document. Derived from [MASTER.md](MASTER.md).

The single source of truth is [MASTER.md](MASTER.md). When anything here conflicts
with the master, the master wins unless an approved ADR changes it.

## Test Categories

See MASTER section 32 for the full list, including unit, API integration,
database, authorization, field-level permission, organization-isolation,
recommendation logic, capacity calculation, AI tool contract, AI evaluation,
document retrieval, prompt-injection, integration contract, webhook replay,
import validation, end-to-end, accessibility, performance, and backup/restore.

## Mandatory Test Scenarios

These must always pass (MASTER section 32):

* A project manager cannot view unauthorized project feedback.
* A team member cannot view another employee's private feedback.
* The AI cannot retrieve unauthorized records or documents.
* The AI cannot execute an expired action proposal.
* The approved action payload cannot change after confirmation.
* A repeated webhook event cannot create duplicate records.
* An employee cannot be confirmed above capacity without an authorized override.
* Unknown availability cannot produce a high-confidence recommendation.
* Protected personal information cannot affect the fit score.
* A failed integration cannot disable native project features.
* Closing a project releases future employee capacity.
* Concurrent updates cannot silently overwrite each other.
