import { request } from '@/services/httpClient';
import {
  AssignmentCreateResultSchema,
  AssignmentListSchema,
  AssignmentSchema,
  RecommendationListSchema,
  RoleRequirementListSchema,
} from '@/features/team-builder/schemas';
import type {
  AssignInput,
  RecommendationParams,
  ReserveInput,
} from '@/features/team-builder/types';

export const teamService = {
  listRequirements: (projectId: string, signal?: AbortSignal) =>
    request(
      `/projects/${projectId}/requirements`,
      RoleRequirementListSchema,
      { signal },
    ),

  getTeam: (projectId: string, signal?: AbortSignal) =>
    request(`/projects/${projectId}/team`, AssignmentListSchema, { signal }),

  recommend: (params: RecommendationParams, signal?: AbortSignal) =>
    request(
      `/projects/${params.projectId}/team/recommendations`,
      RecommendationListSchema,
      {
        method: 'POST',
        body: JSON.stringify({
          role_requirement_id: params.roleRequirementId,
          period_start: params.periodStart,
          period_end: params.periodEnd,
          limit: params.limit ?? 10,
        }),
        signal,
      },
    ),

  reserve: (input: ReserveInput) =>
    request(`/projects/${input.projectId}/reservations`, AssignmentSchema, {
      method: 'POST',
      headers: { 'Idempotency-Key': crypto.randomUUID() },
      body: JSON.stringify({
        role_requirement_id: input.roleRequirementId,
        employee_id: input.employeeId,
        allocation_percent: input.allocationPercent,
        expires_at: input.expiresAt,
      }),
    }),

  assign: (input: AssignInput) =>
    request(
      `/projects/${input.projectId}/assignments`,
      AssignmentCreateResultSchema,
      {
        method: 'POST',
        headers: { 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify({
          role_requirement_id: input.roleRequirementId,
          employee_id: input.employeeId,
          allocation_percent: input.allocationPercent,
          start_date: input.startDate,
          end_date: input.endDate,
          override_reason: input.overrideReason ?? null,
        }),
      },
    ),
};
