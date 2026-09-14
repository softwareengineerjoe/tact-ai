import { request } from '@/services/httpClient';
import { MemberDashboardSchema } from '@/features/member-dashboard/schemas';

export const memberDashboardService = {
  get: (employeeId: string, signal?: AbortSignal) =>
    request(`/people/${employeeId}/dashboard`, MemberDashboardSchema, { signal }),
};
