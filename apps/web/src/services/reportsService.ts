import { request } from '@/services/httpClient';
import { WeeklyStatusReportSchema } from '@/features/reports/schemas';

export const reportsService = {
  getWeeklyStatus: (projectId: string, signal?: AbortSignal) =>
    request(
      `/projects/${projectId}/reports/weekly-status`,
      WeeklyStatusReportSchema,
      { signal },
    ),
};
