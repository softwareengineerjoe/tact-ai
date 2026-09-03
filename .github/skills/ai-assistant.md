# Skill: ai-assistant

**Goal:** Build the single TACT Orchestrator Agent, its secured tools, and the
human-approved write-action flow.

## Use when

Working on the AI assistant, agent tools (read/recommendation/write), chat
sessions/messages, citations, action proposals, or AI audit records.

## Read first

* [AI_SYSTEM.md](../../docs/AI_SYSTEM.md) — agent model, tools, constraints.
* [MASTER.md](../../docs/MASTER.md) §15 (AI system design, tools, action-proposal flow, conversation audit).
* [RBAC_AND_PRIVACY.md](../../docs/RBAC_AND_PRIVACY.md) — the AI inherits caller permissions.
* [BACKEND_STANDARDS.md](../../docs/BACKEND_STANDARDS.md) §12 (AI tools) for the service-call pattern.

## Steps

1. Keep one orchestrator agent for the MVP — no independent multi-agent workflows.
2. Tools are thin wrappers that call **services**, passing the caller's `Principal`.
   The AI never touches the DB directly.
3. Read tools return only authorized data. Write tools produce an immutable
   **AI Action Proposal**; execution requires human approval and a valid,
   unexpired confirmation token.
4. AI answers include the required structure (answer, reasoning, sources, scope,
   freshness, missing info, warnings, next action) — MASTER §15.7.
5. Never invent status/scores; explain deterministic results only.
6. Persist the auditable transcript and tool/action records in PostgreSQL
   (MASTER §15.8). Store model deployment names in config, never hardcoded.

## Guardrails

* The AI can never exceed the caller's permissions.
* The approved payload cannot change after confirmation; expired proposals cannot execute.
* Deterministic scoring stays in a service; the model only explains it.
* Prevent prompt injection from bypassing tool permissions.

## Definition of Done

Tools call services with the caller's Principal; writes go through the proposal +
approval + audit flow; responses carry sources/freshness/warnings; AI tool-contract
and prompt-injection tests pass (MASTER §32).
