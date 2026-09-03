"""Deterministic team recommendations and the Project Fit Score (MASTER FR-009).

The score is computed here with fixed weights. The language model may later
explain a score but must never calculate or invent it. Protected characteristics
and private feedback are never used.
"""

import uuid
from dataclasses import dataclass
from datetime import datetime

from app.core.enums import ProficiencyLevel
from app.core.exceptions import NotFound
from app.models.employee import Employee, EmployeeSkill
from app.models.project import ProjectRoleRequirement
from app.repositories.employee_repository import EmployeeRepository
from app.repositories.project_repository import ProjectRepository
from app.security.permissions import Permission
from app.security.principal import Principal
from app.services.capacity_service import Capacity, CapacityService

# Fixed Project Fit Score weights (MASTER FR-009). Must sum to 100.
_WEIGHT_REQUIRED_SKILLS = 40
_WEIGHT_AVAILABILITY = 30
_WEIGHT_EXPERIENCE = 15
_WEIGHT_PREFERRED_SKILLS = 10
_WEIGHT_TIMEZONE = 5

_PROFICIENCY_RANK = {
    ProficiencyLevel.BEGINNER: 1,
    ProficiencyLevel.INTERMEDIATE: 2,
    ProficiencyLevel.ADVANCED: 3,
    ProficiencyLevel.EXPERT: 4,
}


@dataclass(frozen=True, slots=True)
class ScoredCandidate:
    employee_id: uuid.UUID
    display_name: str
    role_requirement_id: uuid.UUID
    project_fit_score: int
    matched_skills: list[str]
    missing_skills: list[str]
    remaining_capacity_percent: int
    data_freshness: datetime | None
    warnings: list[str]
    recommendation_reason: str


class RecommendationService:
    def __init__(
        self,
        project_repository: ProjectRepository,
        employee_repository: EmployeeRepository,
        capacity_service: CapacityService,
    ) -> None:
        self._projects = project_repository
        self._employees = employee_repository
        self._capacity = capacity_service

    async def recommend_for_role(
        self,
        principal: Principal,
        project_id: uuid.UUID,
        role_requirement_id: uuid.UUID,
        *,
        period_start: datetime,
        period_end: datetime,
        limit: int,
    ) -> list[ScoredCandidate]:
        principal.require(Permission.TEAM_RECOMMEND)

        project = await self._projects.get(principal.organization_id, project_id)
        if project is None:
            raise NotFound("Project not found")
        requirement = await self._projects.get_requirement(
            principal.organization_id, role_requirement_id
        )
        if requirement is None or requirement.project_id != project_id:
            raise NotFound("Project role requirement not found")

        required = _required_skill_names(requirement, preferred=False)
        preferred = _required_skill_names(requirement, preferred=True)

        employees = await self._employees.list_with_skills(principal.organization_id)
        candidates: list[ScoredCandidate] = []
        for employee in employees:
            capacity = await self._capacity.compute_for_employee(
                principal.organization_id,
                employee,
                period_start=period_start,
                period_end=period_end,
            )
            scored = _score_candidate(employee, requirement, required, preferred, capacity)
            if scored is not None:
                candidates.append(scored)

        candidates.sort(key=lambda c: c.project_fit_score, reverse=True)
        return candidates[:limit]


def _required_skill_names(requirement: ProjectRoleRequirement, *, preferred: bool) -> list[str]:
    return [rs.skill.name for rs in requirement.required_skills if rs.is_preferred == preferred]


def _score_candidate(
    employee: Employee,
    requirement: ProjectRoleRequirement,
    required: list[str],
    preferred: list[str],
    capacity: Capacity,
) -> ScoredCandidate | None:
    """Apply hard eligibility, then compute the deterministic fit score.

    Returns ``None`` when the employee is ineligible (MASTER FR-009).
    """
    employee_skills = {es.skill.name: es for es in employee.skills}

    matched_required = [s for s in required if s in employee_skills]
    missing_required = [s for s in required if s not in employee_skills]
    matched_preferred = [s for s in preferred if s in employee_skills]

    # --- Hard eligibility rules (before scoring) ---
    # Must have remaining capacity in the period (Unknown => 0 => ineligible).
    if capacity.remaining_capacity_percent <= 0:
        return None
    # Must match the role or at least one required skill (when skills are defined).
    role_matches = requirement.role_name.lower() in ((employee.primary_role or "").lower())
    if required and not matched_required and not role_matches:
        return None

    # --- Deterministic Project Fit Score ---
    required_coverage = 1.0 if not required else len(matched_required) / len(required)
    availability_ratio = min(capacity.remaining_capacity_percent / 100, 1.0)
    experience_ratio = _experience_ratio(matched_required, employee_skills)
    preferred_coverage = 1.0 if not preferred else len(matched_preferred) / len(preferred)
    timezone_fit = 1.0 if employee.time_zone else 0.5

    score = round(
        _WEIGHT_REQUIRED_SKILLS * required_coverage
        + _WEIGHT_AVAILABILITY * availability_ratio
        + _WEIGHT_EXPERIENCE * experience_ratio
        + _WEIGHT_PREFERRED_SKILLS * preferred_coverage
        + _WEIGHT_TIMEZONE * timezone_fit
    )

    warnings: list[str] = []
    if missing_required:
        warnings.append(f"Missing required skills: {', '.join(missing_required)}")
    if capacity.remaining_capacity_percent < requirement.allocation_percent:
        warnings.append(
            "Remaining capacity is below the requested allocation "
            f"({capacity.remaining_capacity_percent}% < {requirement.allocation_percent}%)"
        )

    reason = _build_reason(matched_required, missing_required, capacity.remaining_capacity_percent)

    return ScoredCandidate(
        employee_id=employee.id,
        display_name=employee.display_name,
        role_requirement_id=requirement.id,
        project_fit_score=score,
        matched_skills=matched_required + matched_preferred,
        missing_skills=missing_required,
        remaining_capacity_percent=capacity.remaining_capacity_percent,
        data_freshness=capacity.last_updated,
        warnings=warnings,
        recommendation_reason=reason,
    )


def _experience_ratio(
    matched_required: list[str], employee_skills: dict[str, EmployeeSkill]
) -> float:
    if not matched_required:
        return 0.0
    total = 0.0
    for name in matched_required:
        rank = _PROFICIENCY_RANK.get(ProficiencyLevel(employee_skills[name].proficiency_level), 1)
        total += rank / 4
    return total / len(matched_required)


def _build_reason(matched_required: list[str], missing_required: list[str], remaining: int) -> str:
    if matched_required and not missing_required:
        return (
            "Strong required-skill coverage and "
            f"{remaining}% remaining capacity for the project period."
        )
    if matched_required:
        return (
            f"Covers {len(matched_required)} required skill(s) with "
            f"{remaining}% remaining capacity; some required skills are missing."
        )
    return f"Role match with {remaining}% remaining capacity; no listed required skills matched."
