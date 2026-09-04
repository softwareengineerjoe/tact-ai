"""TACT Orchestrator service (MASTER 15).

Owns the read-only assistant conversation: it checks the caller holds
``assistant.use``, persists the session/message record (MASTER 15.8), runs the
agent provider (which calls the secured read-only tools with the caller's
Principal), and stores the structured answer, tool executions, and citations.

The AI never touches the database directly and never widens the caller's
permissions — every tool goes through a service that re-checks authorization
(MASTER 15.5, 39.6).
"""

import uuid

from app.agents.provider import PROMPT_VERSION, AgentProvider
from app.agents.tools import ToolContext
from app.core.enums import MessageRole
from app.core.exceptions import NotFound
from app.models.chat import AIToolExecution, ChatMessage, ChatSession, MessageCitation
from app.repositories.chat_repository import ChatRepository
from app.security.permissions import Permission
from app.security.principal import Principal
from app.services.employee_service import EmployeeService
from app.services.feedback_service import FeedbackService
from app.services.project_service import ProjectService
from app.services.ticket_service import TicketService


class AssistantService:
    def __init__(
        self,
        chat_repository: ChatRepository,
        provider: AgentProvider,
        project_service: ProjectService,
        employee_service: EmployeeService,
        ticket_service: TicketService,
        feedback_service: FeedbackService,
    ) -> None:
        self._chats = chat_repository
        self._provider = provider
        self._projects = project_service
        self._employees = employee_service
        self._tickets = ticket_service
        self._feedback = feedback_service

    async def create_session(
        self, principal: Principal, *, title: str | None = None
    ) -> ChatSession:
        principal.require(Permission.ASSISTANT_USE)
        session = ChatSession(
            organization_id=principal.organization_id,
            user_id=principal.user_id,
            title=title or "New conversation",
        )
        return await self._chats.add_session(session)

    async def list_sessions(self, principal: Principal) -> list[ChatSession]:
        principal.require(Permission.ASSISTANT_USE)
        return await self._chats.list_sessions(principal.organization_id, principal.user_id)

    async def get_session(self, principal: Principal, session_id: uuid.UUID) -> ChatSession:
        principal.require(Permission.ASSISTANT_USE)
        session = await self._chats.get_session(principal.organization_id, session_id)
        if session is None or session.user_id != principal.user_id:
            raise NotFound("Chat session not found")
        return session

    async def send_message(
        self, principal: Principal, session_id: uuid.UUID, *, content: str
    ) -> ChatMessage:
        principal.require(Permission.ASSISTANT_USE)
        session = await self.get_session(principal, session_id)

        # Persist the user's turn.
        await self._chats.add_message(
            ChatMessage(
                organization_id=principal.organization_id,
                session_id=session.id,
                role=MessageRole.USER,
                content=content,
            )
        )

        # Run the orchestrator over the secured, permission-inheriting tools.
        ctx = ToolContext(
            principal=principal,
            projects=self._projects,
            employees=self._employees,
            tickets=self._tickets,
            feedback=self._feedback,
        )
        answer = await self._provider.respond(ctx, content)

        assistant_message = ChatMessage(
            organization_id=principal.organization_id,
            session_id=session.id,
            role=MessageRole.ASSISTANT,
            content=answer.answer,
            model_version=answer.model_version,
            prompt_version=PROMPT_VERSION,
            reasoning_summary=answer.reasoning_summary,
            warnings=answer.warnings or None,
            suggested_next_action=answer.suggested_next_action,
            token_usage=answer.token_usage,
        )
        assistant_message.tool_executions = [
            AIToolExecution(
                organization_id=principal.organization_id,
                tool_name=name,
                succeeded=True,
            )
            for name in answer.tools_used
        ]
        assistant_message.citations = [
            MessageCitation(
                organization_id=principal.organization_id,
                source_type=c.source_type,
                source_id=c.source_id,
                label=c.label,
            )
            for c in answer.citations
        ]
        await self._chats.add_message(assistant_message)

        # Reload with citations eager-loaded to keep serialization safe.
        return await self._chats.reload_message(principal.organization_id, assistant_message.id)
