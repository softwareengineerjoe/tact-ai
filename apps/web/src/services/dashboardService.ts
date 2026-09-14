import { request } from '@/services/httpClient';
import { DashboardSchema } from '@/features/dashboard/schemas';

export const dashboardService = {
  get: (signal?: AbortSignal) =>
    request('/dashboard', DashboardSchema, { signal }),
};
