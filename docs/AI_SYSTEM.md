# AI System

**Status:** Companion document. Derived from [MASTER.md](MASTER.md).

The single source of truth is [MASTER.md](MASTER.md). When anything here conflicts
with the master, the master wins unless an approved ADR changes it.

## Agent Model

* MVP uses one central **TACT Orchestrator Agent** (no independent multi-agent workflows).
* Platform: Microsoft Foundry Agent Service.
* Specialized agents are a post-production, future addition (MASTER section 15.9).

## Tooling

* Read-only tools — MASTER section 15.3.
* Recommendation tools — MASTER section 15.4.
* Write tools requiring confirmation — MASTER section 15.5.

## Hard Constraints

* The AI must never write directly to the database; every tool call goes through the backend service layer.
* Human confirmation is required for all write actions (MASTER section 15.6).
* The approved action payload must not change after confirmation.
* Deterministic logic computes the Project Fit Score; the model only explains it.
* AI responses follow the required response structure (MASTER section 15.7).

## Conversation Audit

Microsoft Foundry owns the runtime conversation. PostgreSQL stores the
auditable transcript with the fields listed in MASTER section 15.8.
