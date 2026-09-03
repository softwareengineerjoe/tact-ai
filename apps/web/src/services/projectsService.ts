import { request } from '@/services/httpClient';
import { ProjectListSchema, ProjectSchema } from '@/features/projects/schemas';
import type { CreateProjectInput, ProjectListParams } from '@/features/projects/types';

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
};
