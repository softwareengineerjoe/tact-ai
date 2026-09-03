import { request, requestVoid } from '@/services/httpClient';
import { RoleRequirementSchema } from '@/features/team-builder/schemas';
import type {
  CreateRequirementInput,
  UpdateRequirementInput,
} from '@/features/requirements/types';

export const requirementsService = {
  create: (projectId: string, input: CreateRequirementInput) =>
    request(`/projects/${projectId}/requirements`, RoleRequirementSchema, {
      method: 'POST',
      headers: { 'Idempotency-Key': crypto.randomUUID() },
      body: JSON.stringify({
        role_name: input.roleName,
        headcount: input.headcount,
        allocation_percent: input.allocationPercent,
        description: input.description ?? null,
        required_skills: input.requiredSkills,
        preferred_skills: input.preferredSkills,
      }),
    }),

  update: (input: UpdateRequirementInput) =>
    request(`/project-requirements/${input.requirementId}`, RoleRequirementSchema, {
      method: 'PATCH',
      body: JSON.stringify({
        role_name: input.roleName,
        headcount: input.headcount,
        allocation_percent: input.allocationPercent,
        description: input.description ?? null,
        required_skills: input.requiredSkills,
        preferred_skills: input.preferredSkills,
        version: input.version,
      }),
    }),

  remove: (requirementId: string) =>
    requestVoid(`/project-requirements/${requirementId}`, { method: 'DELETE' }),
};
