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

PROMPT_VERSION = "2026-09-05"

_SYSTEM_PROMPT = (
    "You are the TACT AI orchestrator, a read-only assistant that helps managers "
    "understand their projects, people, capacity, tickets, and feedback. Answer "
    "only from the data returned by the provided tools. If a tool returns no data, "
    "say so plainly. Never invent employees, projects, tickets, scores, or numbers. "
    "You cannot perform write actions in this release. When you lack permission or "
    "data, say so clearly."
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
        input_items: list[dict[str, Any]] = [
            {"role": "system", "content": _SYSTEM_PROMPT},
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
        params = {"api-version": self._api_version}

        async with httpx.AsyncClient(timeout=self._timeout) as client:
            for _ in range(self._max_tool_turns):
                payload = {
                    "model": self._model,
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
