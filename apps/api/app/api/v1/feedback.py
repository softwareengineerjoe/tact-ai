"""Project feedback endpoints (MASTER 22, FR-011)."""

import uuid

from fastapi import APIRouter, Depends, Query, status

from app.api.deps import get_feedback_service, get_principal, require_permission
from app.core.enums import FeedbackVisibility
from app.models.feedback import Feedback
from app.schemas.feedback import FeedbackCreate, FeedbackRead, FeedbackUpdate
from app.security.permissions import Permission
from app.security.principal import Principal
from app.services.feedback_service import FeedbackService

router = APIRouter(tags=["feedback"])


def _to_read(feedback: Feedback) -> FeedbackRead:
    data = FeedbackRead.model_validate(feedback).model_dump(exclude={"employee_name", "is_private"})
    return FeedbackRead(
        **data,
        employee_name=feedback.employee.display_name if feedback.employee else None,
        is_private=feedback.visibility == FeedbackVisibility.MANAGER_ONLY,
    )


@router.get("/projects/{project_id}/feedback", response_model=list[FeedbackRead])
async def list_project_feedback(
    project_id: uuid.UUID,
    principal: Principal = Depends(get_principal),
    service: FeedbackService = Depends(get_feedback_service),
) -> list[FeedbackRead]:
    items = await service.list_for_project(principal, project_id)
    return [_to_read(f) for f in items]


@router.get("/people/{employee_id}/feedback", response_model=list[FeedbackRead])
async def list_employee_feedback(
    employee_id: uuid.UUID,
    principal: Principal = Depends(get_principal),
    service: FeedbackService = Depends(get_feedback_service),
) -> list[FeedbackRead]:
    items = await service.list_for_employee(principal, employee_id)
    return [_to_read(f) for f in items]


@router.get("/feedback/{feedback_id}", response_model=FeedbackRead)
async def get_feedback(
    feedback_id: uuid.UUID,
    principal: Principal = Depends(get_principal),
    service: FeedbackService = Depends(get_feedback_service),
) -> FeedbackRead:
    feedback = await service.get(principal, feedback_id)
    return _to_read(feedback)


@router.post(
    "/projects/{project_id}/feedback",
    response_model=FeedbackRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_feedback(
    project_id: uuid.UUID,
    payload: FeedbackCreate,
    principal: Principal = Depends(require_permission(Permission.FEEDBACK_CREATE)),
    service: FeedbackService = Depends(get_feedback_service),
) -> FeedbackRead:
    feedback = await service.create(principal, project_id, payload)
    return _to_read(feedback)


@router.patch("/feedback/{feedback_id}", response_model=FeedbackRead)
async def update_feedback(
    feedback_id: uuid.UUID,
    payload: FeedbackUpdate,
    principal: Principal = Depends(require_permission(Permission.FEEDBACK_EDIT)),
    service: FeedbackService = Depends(get_feedback_service),
) -> FeedbackRead:
    feedback = await service.update(principal, feedback_id, payload)
    return _to_read(feedback)


@router.post("/feedback/{feedback_id}/acknowledge", response_model=FeedbackRead)
async def acknowledge_feedback(
    feedback_id: uuid.UUID,
    principal: Principal = Depends(require_permission(Permission.FEEDBACK_ACKNOWLEDGE)),
    service: FeedbackService = Depends(get_feedback_service),
) -> FeedbackRead:
    feedback = await service.acknowledge(principal, feedback_id)
    return _to_read(feedback)


@router.delete("/feedback/{feedback_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_feedback(
    feedback_id: uuid.UUID,
    version: int = Query(..., ge=0),
    principal: Principal = Depends(require_permission(Permission.FEEDBACK_EDIT)),
    service: FeedbackService = Depends(get_feedback_service),
) -> None:
    await service.delete(principal, feedback_id, version=version)
