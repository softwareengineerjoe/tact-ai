# Integrations

**Status:** Companion document. Derived from [MASTER.md](MASTER.md).

The single source of truth is [MASTER.md](MASTER.md). When anything here conflicts
with the master, the master wins unless an approved ADR changes it.

## Principles

* All integrations use provider adapters; the core app must not depend on a specific external platform.
* Integrations are optional. Native features must remain available when an integration fails.
* External data must never silently overwrite newer internal data.

## Integration Modes

`Disabled`, `Import Only`, `Export Only`, `Read Only`, `Two-Way Synchronization`.

## Providers

See MASTER sections 16.2–16.7:

* Excel (CSV/XLSX import & export in MVP)
* Jira (canonical ticket system when enabled)
* Workday (first integration is read-only)
* GitHub or Azure DevOps (development activity, read-only initially)
* Microsoft Teams or Slack (notifications)
* SharePoint (future documents)

## Requirements and Conflict Handling

Every integration must define the configuration fields in MASTER section 16.8
and follow the conflict-handling flow: detect revision mismatch, mark the record
as conflicted, show both versions, apply the configured rule or request manual
resolution, and record the decision.
