# 0001. AI assistant provider abstraction with a deterministic local fallback

* **Status:** Accepted
* **Date:** 2026-09-05
* **Deciders:** TACT AI engineering
* **Related requirement(s):** MASTER §15, §18.4, §30 (Phase 1), §32; FR-020

## Context

MASTER §18.4 names Microsoft Foundry Agent Service as the agent platform and a
configurable Foundry model deployment as the model. Sprint 5 delivers the
read-only assistant (MASTER §30, Phase 1, FR-020).

Binding directly to Foundry for all execution paths would make the assistant
untestable offline, force every CI run and local developer to hold a live
endpoint and secret, and couple the orchestrator to one provider's transport.
MASTER §32 also requires prompt-injection and permission-inheritance tests that
must run deterministically without network access.

## Decision

Introduce an `AgentProvider` protocol with two implementations behind it:

* `FoundryAgentProvider` — the **primary** provider. It calls the Foundry
  OpenAI-compatible `/openai/v1/responses` endpoint (model `gpt-4.1`), running a
  bounded tool-calling loop over the secured read-only tools. Used whenever an
  endpoint and API key are configured.
* `LocalDeterministicProvider` — a rule-based, no-network fallback that answers
  strictly from the same secured tool results. Used for tests, CI, and offline
  development, and as an automatic fallback when the Foundry call fails.

Provider selection is configuration-driven in `deps.get_agent_provider()`:
Foundry when `ai_foundry_configured` is true, otherwise the local provider.

This does **not** change the chosen platform: Foundry remains the production
agent runtime and model host. The abstraction only adds a deterministic
implementation of the same read-only contract.

Both providers are equally constrained by the existing rules: they only read
through tools that call services with the caller's `Principal`, they never touch
the database directly, and they cannot widen the caller's permissions
(MASTER §15.5, §39.6).

## Consequences

* Positive:
  * Tests and CI run with no secrets and no network (MASTER §32).
  * The assistant degrades gracefully if Foundry is unavailable.
  * Transport details stay isolated behind one interface.
* Negative / trade-offs:
  * Two response paths to maintain; the local provider's phrasing is simpler
    than the model's and is not a substitute for real answers in production.
* Follow-up actions:
  * Documented in [AI_SYSTEM.md](../AI_SYSTEM.md) (provider selection section).
  * Covered by `tests/test_sprint5_assistant.py` (tool contract, permission
    inheritance, prompt injection, grounding).
