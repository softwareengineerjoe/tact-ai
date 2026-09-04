# AI System

**Status:** Companion document. Derived from [MASTER.md](MASTER.md).

The single source of truth is [MASTER.md](MASTER.md). When anything here conflicts
with the master, the master wins unless an approved ADR changes it.

## Agent Model

* MVP uses one central **TACT Orchestrator Agent** (no independent multi-agent workflows).
* Platform: Microsoft Foundry Agent Service.
* Specialized agents are a post-production, future addition (MASTER section 15.9).

## Provider Selection (ADR 0001)

The orchestrator runs behind an `AgentProvider` interface with two
implementations of the same read-only contract:

* **`FoundryAgentProvider`** — primary. Calls the Foundry
  `/openai/v1/responses` endpoint (model `gpt-4.1`) with a bounded tool-calling
  loop. Used whenever an endpoint + API key are configured.
* **`LocalDeterministicProvider`** — rule-based, no-network fallback used for
  tests, CI, offline development, and automatic recovery if the Foundry call
  fails. It answers strictly from the same secured tool results.

Selection is configuration-driven (`ai_foundry_endpoint` / `ai_foundry_api_key`).
This does not change the chosen platform — Foundry remains the production runtime
and model host. See [adr/0001-ai-provider-abstraction.md](adr/0001-ai-provider-abstraction.md).

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
