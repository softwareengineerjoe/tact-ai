# Domain Rules

**Status:** Companion document. Derived from [MASTER.md](MASTER.md).

The single source of truth is [MASTER.md](MASTER.md). This document collects the
core business rules. When anything here conflicts with the master, the master
wins unless an approved ADR changes it.

## Key Rule Sets

* Source-of-truth ownership per data type — see MASTER section 12.
* Ticket provider modes (NATIVE, JIRA, AZURE_DEVOPS) — see MASTER section 13.
* Project lifecycle and activation rules — see MASTER FR-002.
* Availability and capacity formula — see MASTER FR-006.
* Assignment lifecycle and rules — see MASTER FR-008.
* Deterministic recommendation scoring and restrictions — see MASTER FR-009.
* Ticket flow and statuses — see MASTER FR-010.
* Feedback lifecycle and privacy rules — see MASTER FR-011.
* Project progress and health rules — see MASTER FR-013, FR-014.
* Data rules (UUIDs, UTC, soft delete, optimistic concurrency) — see MASTER section 21.

## Non-Negotiable Invariants

* Deterministic scoring only; the LLM explains but never computes the Project Fit Score.
* Unknown availability is never treated as available.
* Protected characteristics and private feedback never affect the fit score.
* Overallocation requires an explicit permission and override reason.
* Closing a project releases future allocations.
* Feedback correlates to project participation: it can only be recorded for an
  employee who worked or is working on the project — i.e. one with a qualifying
  assignment (`confirmed`, `active`, or `ended`) on that project (FR-011).
* No physical deletion of projects, feedback, assignments, or audit records.

## Intentional Simplifications (current implementation)

These are deliberate, documented deviations kept simple until a later phase
needs them (YAGNI). They are noted here so they are not mistaken for omissions.

* **Approved leave is not yet a distinct capacity input (FR-006).** The capacity
  formula lists Approved Leave as a separate deduction, but leave is not modeled
  as its own entity today. `approved_leave_percent` is always `0`; leave impact
  is instead expressed through the employee's `base_capacity_percent` on their
  availability record. A dedicated `LeavePeriod` deduction can be added when the
  product needs calendar/Workday-sourced leave.
* **Recommendation rejection reasons are not persisted (FR-007).** Capacity
  *override* reasons are captured on the assignment, but a rejected/overridden
  *recommendation* reason (the `RecommendationDecision` / `RecommendationOverride`
  models) is not stored yet. This is planned alongside the AI assistant work in
  Sprint 5, where recommendation decisions become auditable.

