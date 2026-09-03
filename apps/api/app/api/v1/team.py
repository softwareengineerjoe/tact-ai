"""Team Builder endpoints: recommendations, reservations, assignments (MASTER 22)."""

import uuid

from fastapi import APIRouter, Depends, status

from app.api.deps import (
    get_assignment_service,
    get_principal,
    get_recommendation_service,
    require_permission,
)
from app.schemas.team import (
    AssignmentCreate,
    AssignmentCreateResult,
    AssignmentRead,
    AssignmentUpdate,
    RecommendationCandidate,
    RecommendationRequest,
    ReservationCreate,
)
from app.security.permissions import Permission
from app.security.principal import Principal
from app.services.assignment_service import AssignmentService
from app.services.recommendation_service import RecommendationService

router = APIRouter(tags=["team"])


@router.get(
    "/projects/{project_id}/team",
    response_model=list[AssignmentRead],
)
async def get_project_team(
    project_id: uuid.UUID,
    principal: Principal = Depends(get_principal),
    service: AssignmentService = Depends(get_assignment_service),
) -> list[AssignmentRead]:
    items = await service.list_team(principal, project_id)
    return [AssignmentRead.model_validate(a) for a in items]


@router.post(
    "/projects/{project_id}/team/recommendations",
    response_model=list[RecommendationCandidate],
)
async def recommend_team(
    project_id: uuid.UUID,
    payload: RecommendationRequest,
    principal: Principal = Depends(require_permission(Permission.TEAM_RECOMMEND)),
    service: RecommendationService = Depends(get_recommendation_service),
) -> list[RecommendationCandidate]:
    candidates = await service.recommend_for_role(
        principal,
        project_id,
        payload.role_requirement_id,
        period_start=payload.period_start,
        period_end=payload.period_end,
        limit=payload.limit,
    )
    return [
        RecommendationCandidate(
            employee_id=c.employee_id,
            display_name=c.display_name,
            role_requirement_id=c.role_requirement_id,
            project_fit_score=c.project_fit_score,
            matched_skills=c.matched_skills,
            missing_skills=c.missing_skills,
            remaining_capacity_percent=c.remaining_capacity_percent,
            data_freshness=c.data_freshness,
            warnings=c.warnings,
            recommendation_reason=c.recommendation_reason,
        )
        for c in candidates
    ]


@router.post(
    "/projects/{project_id}/reservations",
    response_model=AssignmentRead,
    status_code=status.HTTP_201_CREATED,
)
async def reserve_employee(
    project_id: uuid.UUID,
    payload: ReservationCreate,
    principal: Principal = Depends(require_permission(Permission.TEAM_ASSIGN)),
    service: AssignmentService = Depends(get_assignment_service),
) -> AssignmentRead:
    assignment = await service.reserve(principal, project_id, payload)
    return AssignmentRead.model_validate(assignment)


@router.post(
    "/projects/{project_id}/assignments",
    response_model=AssignmentCreateResult,
    status_code=status.HTTP_201_CREATED,
)
async def create_assignment(
    project_id: uuid.UUID,
    payload: AssignmentCreate,
    principal: Principal = Depends(require_permission(Permission.TEAM_ASSIGN)),
    service: AssignmentService = Depends(get_assignment_service),
) -> AssignmentCreateResult:
    result = await service.create_assignment(principal, project_id, payload)
    return AssignmentCreateResult(
        assignment=AssignmentRead.model_validate(result.assignment),
        warnings=result.warnings,
    )


@router.patch("/assignments/{assignment_id}", response_model=AssignmentRead)
async def update_assignment(
    assignment_id: uuid.UUID,
    payload: AssignmentUpdate,
    principal: Principal = Depends(get_principal),
    service: AssignmentService = Depends(get_assignment_service),
) -> AssignmentRead:
    assignment = await service.update_status(principal, assignment_id, payload)
    return AssignmentRead.model_validate(assignment)
