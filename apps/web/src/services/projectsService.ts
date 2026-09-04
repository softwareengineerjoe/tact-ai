import { request, requestVoid } from '@/services/httpClient';
import { ProjectListSchema, ProjectSchema } from '@/features/projects/schemas';
import type {
  CreateProjectInput,
  ProjectListParams,
  UpdateProjectDetailsInput,
  UpdateProjectInput,
} from '@/features/projects/types';

function toQuery(params: ProjectListParams): string {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.pageSize) query.set('page_size', String(params.pageSize));
  if (params.status) query.set('status', params.status);
  if (params.search) query.set('search', params.search);
  return query.toString();
}

export const projectsService = {
  list: (params: ProjectListParams, signal?: AbortSignal) =>
    request(`/projects?${toQuery(params)}`, ProjectListSchema, { signal }),

  get: (projectId: string, signal?: AbortSignal) =>
    request(`/projects/${projectId}`, ProjectSchema, { signal }),

  create: (input: CreateProjectInput) =>
    request('/projects', ProjectSchema, {
      method: 'POST',
      headers: { 'Idempotency-Key': crypto.randomUUID() },
      body: JSON.stringify(input),
    }),

  update: (projectId: string, input: UpdateProjectInput) =>
    request(`/projects/${projectId}`, ProjectSchema, {
      method: 'PATCH',
      body: JSON.stringify({
        start_date: input.startDate,
        target_end_date: input.targetEndDate,
        version: input.version,
      }),
    }),

  updateDetails: (projectId: string, input: UpdateProjectDetailsInput) =>
    request(`/projects/${projectId}`, ProjectSchema, {
      method: 'PATCH',
      body: JSON.stringify({
        name: input.name,
        description: input.description,
        business_objective: input.businessObjective,
        priority: input.priority,
        expected_team_size: input.expectedTeamSize,
        version: input.version,
      }),
    }),

  remove: (projectId: string) =>
    requestVoid(`/projects/${projectId}`, { method: 'DELETE' }),
};
