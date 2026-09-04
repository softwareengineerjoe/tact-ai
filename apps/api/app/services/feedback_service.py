"""Feedback management: creation, visibility, revisions, acknowledgement (FR-011).

Enforces the privacy rules (MASTER FR-011, 28): private (MANAGER_ONLY) feedback
requires ``feedback.view_private`` and its reads are audited; shared feedback
requires ``feedback.view_shared``. A revision snapshot is kept on every content
change. Feedback never affects the recommendation score.
"""

import uuid

from app.core.enums import FeedbackStatus, FeedbackVisibility
from app.core.exceptions import ConflictError, NotFound, PermissionDenied
from app.models.feedback import (
    Feedback,
    FeedbackAccessLog,
    FeedbackAcknowledgement,
    FeedbackRevision,
)
from app.repositories.audit_repository import AuditRepository
from app.repositories.feedback_repository import FeedbackRepository
from app.repositories.project_repository import ProjectRepository
from app.schemas.feedback import FeedbackCreate, FeedbackUpdate
from app.security.permissions import Permission
from app.security.principal import Principal


def _is_private(feedback: Feedback) -> bool:
    return feedback.visibility == FeedbackVisibility.MANAGER_ONLY


class FeedbackService:
    def __init__(
        self,
        feedback_repository: FeedbackRepository,
        project_repository: ProjectRepository,
        audit_repository: AuditRepository,
    ) -> None:
        self._feedback = feedback_repository
        self._projects = project_repository
        self._audit = audit_repository

    async def list_for_project(self, principal: Principal, project_id: uuid.UUID) -> list[Feedback]:
        principal.require(Permission.FEEDBACK_VIEW_SHARED)
        await self._require_project(principal, project_id)
        include_private = principal.has(Permission.FEEDBACK_VIEW_PRIVATE)
        return await self._feedback.list_for_project(
            principal.organization_id, project_id, include_private=include_private
        )

    async def get(self, principal: Principal, feedback_id: uuid.UUID) -> Feedback:
        feedback = await self._require_feedback(principal, feedback_id)
        if _is_private(feedback):
            principal.require(Permission.FEEDBACK_VIEW_PRIVATE)
            # Audit the private-feedback read in the same transaction (MASTER 28).
            await self._feedback.record_access(
                FeedbackAccessLog(
                    organization_id=principal.organization_id,
                    feedback_id=feedback.id,
                    accessed_by=principal.user_id,
                )
            )
        else:
            principal.require(Permission.FEEDBACK_VIEW_SHARED)
        return feedback

    async def create(
        self, principal: Principal, project_id: uuid.UUID, data: FeedbackCreate
    ) -> Feedback:
        principal.require(Permission.FEEDBACK_CREATE)
        await self._require_project(principal, project_id)

        feedback = Feedback(
            organization_id=principal.organization_id,
            project_id=project_id,
            employee_id=data.employee_id,
            author_id=principal.user_id,
            category=data.category,
            visibility=data.visibility,
            body=data.body,
            status=FeedbackStatus.SUBMITTED,
        )
        created = await self._feedback.add(feedback)
        await self._feedback.add_revision(
            FeedbackRevision(
                organization_id=principal.organization_id,
                feedback_id=created.id,
                editor_id=principal.user_id,
                body=data.body,
            )
        )
        await self._audit.record(
            organization_id=principal.organization_id,
            actor_id=principal.user_id,
            action="feedback.create",
            resource_type="feedback",
            resource_id=created.id,
        )
        return created

    async def update(
        self, principal: Principal, feedback_id: uuid.UUID, data: FeedbackUpdate
    ) -> Feedback:
        principal.require(Permission.FEEDBACK_EDIT)
        feedback = await self._require_feedback(principal, feedback_id)
        if feedback.version != data.version:
            raise ConflictError("Feedback was modified by someone else")

        if data.body is not None and data.body != feedback.body:
            await self._feedback.add_revision(
                FeedbackRevision(
                    organization_id=principal.organization_id,
                    feedback_id=feedback.id,
                    editor_id=principal.user_id,
                    body=data.body,
                )
            )
            feedback.body = data.body
        if data.category is not None:
            feedback.category = data.category
        if data.visibility is not None:
            feedback.visibility = data.visibility
        if data.status is not None:
            feedback.status = data.status
        feedback.version += 1
        await self._audit.record(
            organization_id=principal.organization_id,
            actor_id=principal.user_id,
            action="feedback.update",
            resource_type="feedback",
            resource_id=feedback.id,
        )
        return feedback

    async def acknowledge(self, principal: Principal, feedback_id: uuid.UUID) -> Feedback:
        principal.require(Permission.FEEDBACK_ACKNOWLEDGE)
        feedback = await self._require_feedback(principal, feedback_id)
        # An employee can only acknowledge feedback shared with them.
        if _is_private(feedback):
            raise PermissionDenied("Private feedback cannot be acknowledged")
        await self._feedback.add_acknowledgement(
            FeedbackAcknowledgement(
                organization_id=principal.organization_id,
                feedback_id=feedback.id,
                acknowledged_by=principal.user_id,
            )
        )
        feedback.status = FeedbackStatus.ACKNOWLEDGED
        feedback.version += 1
        await self._audit.record(
            organization_id=principal.organization_id,
            actor_id=principal.user_id,
            action="feedback.acknowledge",
            resource_type="feedback",
            resource_id=feedback.id,
        )
        return feedback

    async def _require_project(self, principal: Principal, project_id: uuid.UUID) -> None:
        project = await self._projects.get(principal.organization_id, project_id)
        if project is None:
            raise NotFound("Project not found")

    async def _require_feedback(self, principal: Principal, feedback_id: uuid.UUID) -> Feedback:
        feedback = await self._feedback.get(principal.organization_id, feedback_id)
        if feedback is None:
            raise NotFound("Feedback not found")
        return feedback
