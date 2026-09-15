"""Agent provider abstraction (approved deviation — see ADR 0001).

MASTER 18.4 names Microsoft Foundry as the agent platform. To keep the
orchestrator testable, runnable offline, and free of hard secret requirements in
CI, the provider is an interface with two implementations:

* ``FoundryAgentProvider`` — primary, calls the Foundry OpenAI-compatible
  ``/responses`` endpoint. Used whenever an endpoint + key are configured.
* ``LocalDeterministicProvider`` — a rule-based fallback that produces grounded
  answers directly from tool results with no external call. Used for tests, CI,
  and offline development (no credentials needed).

Both providers only ever read through the secured tools; neither can widen the
caller's permissions or write data.
"""

import json
from dataclasses import dataclass
from typing import Any, Protocol

import httpx

from app.agents.tools import TOOLS, Citation, ToolContext, tool_specs

PROMPT_VERSION = "2026-09-15"

# Attribution for "who made you" style questions (kept in one place).
CREATOR_HANDLE = "softwareengineerjoe"

_SYSTEM_PROMPT = (
    "You are Tia, the TACT AI orchestrator: a read-only assistant that helps "
    "managers understand and reason about their projects, people, capacity, "
    "tickets, and feedback.\n\n"
    f"About you: TACT AI was created by {CREATOR_HANDLE}. If the user asks who "
    "made, built, created, or is the author/developer of the app or of you, tell "
    f"them TACT AI was built by {CREATOR_HANDLE}. This is general product "
    "information, not user data.\n\n"
    "Two kinds of questions — answer both:\n"
    "1. DATA questions (who is available, which tickets are blocked, project "
    "health, capacity numbers): answer ONLY from the data returned by the tools. "
    "Never invent employees, projects, tickets, scores, or numbers. If the tools "
    "genuinely return no data, say so plainly.\n"
    "2. PRODUCT questions (how does the Team Builder work, what is a Project Fit "
    "Score, how is capacity calculated, what can you do): answer conceptually "
    "from the product knowledge below. These are NOT data lookups — do not say "
    "you lack data or tools for them; explain how the feature works.\n\n"
    "Product knowledge (use to explain how TACT AI works):\n"
    "- Team Builder & Project Fit Score: recommendations are scored "
    "deterministically by a backend service (the AI only explains, never invents "
    "the score). Weighting: required-skill coverage 40%, availability & capacity "
    "30%, relevant experience 15%, preferred skills 10%, time-zone/schedule fit "
    "5%. Each recommendation shows matched skills, missing skills, remaining "
    "capacity, and conflicts; the manager makes the final decision.\n"
    "- Capacity: remaining capacity = base working capacity − approved leave − "
    "confirmed allocations − tentative reservations. Statuses: Available, "
    "Partially Available, Fully Allocated, Overallocated, Unknown. Unknown is "
    "never treated as available.\n"
    "- Project health is rule-based (Green / Amber / Red); progress rolls up from "
    "story points or completed tickets. Feedback can be private and is never used "
    "in recommendation scoring.\n\n"
    "Formatting (make answers premium and scannable, not a wall of text):\n"
    "- Use short Markdown: '##' subheadings, '- ' bullet lists, '**bold**' for "
    "key terms.\n"
    "- Use a Markdown pipe table when comparing items or listing rows (e.g. "
    "roles, candidates, tickets).\n"
    "- For a numeric breakdown or distribution, emit a fenced ```chart block with "
    "one 'Label: number' per line (e.g. score weightings, tickets per status, "
    "capacity per person). Only use real numbers from tools for data questions.\n"
    "- Keep it concise; lead with the answer, then supporting detail.\n\n"
    "Retrieval guidance:\n"
    "- Prefer broad retrieval first: call tools with NO filter arguments, then "
    "narrow in your own reasoning. Do not pass a 'status' or 'employment_status' "
    "filter unless the user explicitly asked to restrict by that value.\n"
    "- For 'who is available', list all employees and interpret their "
    "employment_status yourself rather than pre-filtering.\n"
    "- To answer about tickets or feedback you must first find the project id via "
    "search_projects, then call the project-scoped tool.\n"
    "- If a filtered call returns nothing, retry once without the filter before "
    "concluding there is no data.\n\n"
    "You cannot perform write actions in this release. When you lack permission, "
    "say so clearly."
)


@dataclass(frozen=True, slots=True)
class AgentAnswer:
    """Structured assistant answer (MASTER 15.7)."""

    answer: str
    reasoning_summary: str | None
    citations: list[Citation]
    warnings: list[str]
    suggested_next_action: str | None
    model_version: str | None
    token_usage: int | None
    tools_used: list[str]


def _product_knowledge_answer(question: str) -> AgentAnswer | None:
    """Guaranteed rich answers for conceptual product questions (no LLM needed).

    These are *how the product works* questions, not data lookups, so the answer
    is deterministic and formatted with Markdown, tables, and ``chart`` blocks so
    the client renders premium typography and diagrams every time. Returns None
    when the question is not a known concept, so data questions fall through to
    the tool-backed path.
    """
    q = question.lower()

    def has(*words: str) -> bool:
        return any(w in q for w in words)

    # Team Builder / Project Fit Score.
    if has("team builder", "fit score", "recommend", "recommendation", "matched to", "staffing score"):
        return AgentAnswer(
            answer=(
                "## How the Team Builder recommends people\n\n"
                "It ranks candidates for a role with a **Project Fit Score** that a "
                "backend service computes **deterministically** — I only explain it, "
                "I never invent the number.\n\n"
                "The score weights five factors:\n\n"
                "```chart\n"
                "Required skills: 40\n"
                "Availability: 30\n"
                "Experience: 15\n"
                "Preferred skills: 10\n"
                "Time-zone fit: 5\n"
                "```\n\n"
                "Each recommendation also shows **matched skills**, **missing "
                "skills**, remaining capacity, and any conflicts. The manager always "
                "makes the final call."
            ),
            reasoning_summary="Explained the Team Builder scoring model.",
            citations=[],
            warnings=[],
            suggested_next_action="Open a project's Team Builder to see live recommendations.",
            model_version="product-knowledge",
            token_usage=None,
            tools_used=[],
        )

    # Capacity / availability.
    if has("capacity", "availability", "overalloc", "workload"):
        return AgentAnswer(
            answer=(
                "## How capacity is calculated\n\n"
                "For a chosen period, **remaining capacity** is:\n\n"
                "> Base working capacity − approved leave − confirmed allocations − "
                "tentative reservations\n\n"
                "People fall into one of these states:\n\n"
                "| Status | Meaning |\n"
                "| --- | --- |\n"
                "| Available | Has meaningful free capacity |\n"
                "| Partially Available | Some capacity remains |\n"
                "| Fully Allocated | No spare capacity |\n"
                "| Overallocated | Committed beyond 100% |\n"
                "| Unknown | Not enough data — never treated as available |\n\n"
                "TACT AI **warns** before confirming anyone above capacity."
            ),
            reasoning_summary="Explained the capacity formula and statuses.",
            citations=[],
            warnings=[],
            suggested_next_action="Ask 'who is available for a backend role' to see real numbers.",
            model_version="product-knowledge",
            token_usage=None,
            tools_used=[],
        )

    # Project health / progress.
    if has("project health", "health status", "green amber red", "progress"):
        return AgentAnswer(
            answer=(
                "## Project health & progress\n\n"
                "**Health** is rule-based, not guessed:\n\n"
                "| Status | When |\n"
                "| --- | --- |\n"
                "| Green | On track — no critical blockers or gaps |\n"
                "| Amber | At risk — deadlines nearing, a role unfilled, or stale data |\n"
                "| Red | Critical — overdue milestone, unfilled critical role, or no manager |\n\n"
                "**Progress** rolls up from completed story points (or completed "
                "tickets when points aren't available). Cancelled tickets don't count."
            ),
            reasoning_summary="Explained the health and progress rules.",
            citations=[],
            warnings=[],
            suggested_next_action="Open a project overview to see its live health.",
            model_version="product-knowledge",
            token_usage=None,
            tools_used=[],
        )

    # What can you do / capabilities.
    if has("what can you do", "what do you do", "your capabilities", "what can you help"):
        return AgentAnswer(
            answer=(
                "## What I can help with\n\n"
                "I answer questions using only the data your role is allowed to see:\n\n"
                "- **People & capacity** — who's available, skills, workload\n"
                "- **Projects** — health, progress, staffing gaps\n"
                "- **Tickets** — what's open, blocked, or overdue\n"
                "- **Feedback & reports** — summaries you're authorized to view\n\n"
                "I'm **read-only** in this release: for anything that changes data I "
                "prepare a proposal a human approves first."
            ),
            reasoning_summary="Listed assistant capabilities.",
            citations=[],
            warnings=[],
            suggested_next_action="Try 'which tickets are blocked?' or 'who is overallocated?'",
            model_version="product-knowledge",
            token_usage=None,
            tools_used=[],
        )

    return None


class AgentProvider(Protocol):
    async def respond(self, ctx: ToolContext, question: str) -> AgentAnswer: ...


async def _run_tool(
    ctx: ToolContext, name: str, arguments: dict[str, Any]
) -> tuple[Any, list[Citation], str | None]:
    """Execute one tool safely, returning (data, citations, error)."""
    tool = TOOLS.get(name)
    if tool is None:
        return None, [], f"Unknown tool: {name}"
    try:
        result = await tool.run(ctx, arguments)
    except Exception as exc:  # noqa: BLE001 — surfaced as a warning, never raised to the model
        return None, [], str(exc)
    return result.data, result.citations, None


class LocalDeterministicProvider:
    """Rule-based, no-network provider used for CI/offline (ADR 0001).

    It picks a relevant tool from the question, runs it through the same secured
    tool layer, and summarizes the grounded result. It never fabricates data.
    """

    def _pick_tool(self, question: str) -> tuple[str, dict[str, Any]]:
        q = question.lower()
        if any(word in q for word in ("ticket", "blocked", "blocker", "overdue")):
            return "search_projects", {}  # ticket lookups need a project id; guide via projects
        if any(word in q for word in ("who", "employee", "people", "available", "skill", "staff")):
            return "search_employees", {}
        return "search_projects", {}

    async def respond(self, ctx: ToolContext, question: str) -> AgentAnswer:
        q = question.lower()
        if ("who" in q or "author" in q or "creator" in q) and any(
            word in q for word in ("made", "built", "created", "develop", "author", "behind", "creator")
        ):
            return AgentAnswer(
                answer=f"TACT AI was created by {CREATOR_HANDLE}.",
                reasoning_summary="Answered from product attribution.",
                citations=[],
                warnings=[],
                suggested_next_action=None,
                model_version="local-deterministic",
                token_usage=None,
                tools_used=[],
            )

        concept = _product_knowledge_answer(question)
        if concept is not None:
            return concept

        name, arguments = self._pick_tool(question)
        data, citations, error = await _run_tool(ctx, name, arguments)

        warnings: list[str] = []
        if error is not None:
            warnings.append(error)
            return AgentAnswer(
                answer="I could not retrieve that information.",
                reasoning_summary=f"Tool {name} failed.",
                citations=[],
                warnings=warnings,
                suggested_next_action=None,
                model_version="local-deterministic",
                token_usage=None,
                tools_used=[name],
            )

        items = data.get("items", []) if isinstance(data, dict) else []
        if not items:
            answer = "I found no matching records you are authorized to view."
        elif name == "search_employees":
            names = ", ".join(str(i["display_name"]) for i in items[:10])
            answer = f"I found {len(items)} employee(s): {names}."
        else:
            names = ", ".join(str(i["name"]) for i in items[:10])
            answer = f"I found {len(items)} project(s): {names}."

        return AgentAnswer(
            answer=answer,
            reasoning_summary=f"Answered from the {name} tool over authorized data.",
            citations=citations,
            warnings=warnings,
            suggested_next_action="Ask about a specific project to see its tickets or feedback.",
            model_version="local-deterministic",
            token_usage=None,
            tools_used=[name],
        )


class FoundryAgentProvider:
    """Primary provider: Foundry OpenAI-compatible ``/responses`` endpoint.

    Runs a small tool-calling loop: the model may call the secured read-only
    tools; results are fed back until it returns a final answer. Falls back to
    the deterministic provider if the call fails so the assistant stays usable.
    """

    def __init__(
        self,
        *,
        endpoint: str,
        api_key: str,
        api_version: str,
        model: str,
        max_tool_turns: int = 4,
        timeout_seconds: float = 30.0,
    ) -> None:
        self._endpoint = endpoint
        self._api_key = api_key
        self._api_version = api_version
        self._model = model
        self._max_tool_turns = max_tool_turns
        self._timeout = timeout_seconds
        self._fallback = LocalDeterministicProvider()

    async def respond(self, ctx: ToolContext, question: str) -> AgentAnswer:
        concept = _product_knowledge_answer(question)
        if concept is not None:
            return concept
        try:
            return await self._respond(ctx, question)
        except httpx.HTTPError, KeyError, ValueError, json.JSONDecodeError:
            answer = await self._fallback.respond(ctx, question)
            return AgentAnswer(
                answer=answer.answer,
                reasoning_summary=answer.reasoning_summary,
                citations=answer.citations,
                warnings=[
                    *answer.warnings,
                    "The AI service was unavailable; used a local fallback.",
                ],
                suggested_next_action=answer.suggested_next_action,
                model_version=answer.model_version,
                token_usage=None,
                tools_used=answer.tools_used,
            )

    async def _respond(self, ctx: ToolContext, question: str) -> AgentAnswer:
        # The system prompt goes in the top-level ``instructions`` field; the
        # ``/responses`` API rejects a bare ``system`` role input item.
        input_items: list[dict[str, Any]] = [
            {"role": "user", "content": question},
        ]
        citations: list[Citation] = []
        tools_used: list[str] = []
        warnings: list[str] = []
        total_tokens = 0

        headers = {
            "api-key": self._api_key,
            "Content-Type": "application/json",
        }
        # The newer Foundry ``/openai/v1/`` path rejects the ``api-version``
        # query parameter; only the legacy ``/openai/deployments`` path needs it.
        params = {} if "/openai/v1/" in self._endpoint else {"api-version": self._api_version}

        async with httpx.AsyncClient(timeout=self._timeout) as client:
            for _ in range(self._max_tool_turns):
                payload = {
                    "model": self._model,
                    "instructions": _SYSTEM_PROMPT,
                    "input": input_items,
                    "tools": tool_specs(),
                }
                response = await client.post(
                    self._endpoint, headers=headers, params=params, json=payload
                )
                response.raise_for_status()
                body = response.json()
                total_tokens += int(body.get("usage", {}).get("total_tokens", 0) or 0)

                function_calls = [
                    item for item in body.get("output", []) if item.get("type") == "function_call"
                ]
                if not function_calls:
                    return AgentAnswer(
                        answer=_extract_text(body),
                        reasoning_summary="Answered via Foundry with secured read-only tools.",
                        citations=citations,
                        warnings=warnings,
                        suggested_next_action=None,
                        model_version=self._model,
                        token_usage=total_tokens or None,
                        tools_used=tools_used,
                    )

                for call in function_calls:
                    name = call.get("name", "")
                    tools_used.append(name)
                    try:
                        arguments = json.loads(call.get("arguments") or "{}")
                    except json.JSONDecodeError:
                        arguments = {}
                    data, tool_citations, error = await _run_tool(ctx, name, arguments)
                    citations.extend(tool_citations)
                    if error is not None:
                        warnings.append(error)
                    input_items.append(call)
                    input_items.append(
                        {
                            "type": "function_call_output",
                            "call_id": call.get("call_id"),
                            "output": json.dumps({"data": data, "error": error}),
                        }
                    )

        warnings.append("Reached the tool-call limit before a final answer.")
        return AgentAnswer(
            answer=(
                "I gathered some data but could not finish the answer. Please refine the question."
            ),
            reasoning_summary=None,
            citations=citations,
            warnings=warnings,
            suggested_next_action=None,
            model_version=self._model,
            token_usage=total_tokens or None,
            tools_used=tools_used,
        )


def _extract_text(body: dict[str, Any]) -> str:
    """Pull assistant text out of a /responses body."""
    text = body.get("output_text")
    if isinstance(text, str) and text.strip():
        return text.strip()
    parts: list[str] = []
    for item in body.get("output", []):
        if item.get("type") == "message":
            for chunk in item.get("content", []):
                if chunk.get("type") in {"output_text", "text"} and chunk.get("text"):
                    parts.append(str(chunk["text"]))
    return "\n".join(parts).strip() or "I do not have an answer for that."
