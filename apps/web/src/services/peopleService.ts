import { request } from '@/services/httpClient';
import { EmployeeListSchema } from '@/features/people/schemas';
import type { EmployeeListParams } from '@/features/people/types';

function toQuery(params: EmployeeListParams): string {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.pageSize) query.set('page_size', String(params.pageSize));
  if (params.search) query.set('search', params.search);
  if (params.department) query.set('department', params.department);
  if (params.employmentStatus) query.set('employment_status', params.employmentStatus);
  return query.toString();
}

export const peopleService = {
  list: (params: EmployeeListParams, signal?: AbortSignal) =>
    request(`/people?${toQuery(params)}`, EmployeeListSchema, { signal }),
};
