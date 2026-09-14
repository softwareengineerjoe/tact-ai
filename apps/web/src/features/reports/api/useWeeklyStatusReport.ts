import { useQuery } from '@tanstack/react-query';

import { reportsService } from '@/services/reportsService';
import type { ApiError } from '@/services/httpClient';
import type { WeeklyStatusReport } from '@/features/reports/types';
import { reportKeys } from './reportKeys';

/** Load a deterministic weekly project status report (MASTER FR-017). */
export function useWeeklyStatusReport(projectId: string) {
  return useQuery<WeeklyStatusReport, ApiError>({
    queryKey: reportKeys.weeklyStatus(projectId),
    queryFn: ({ signal }) =>
      reportsService.getWeeklyStatus(projectId, signal),
    staleTime: 30_000,
    enabled: projectId !== '',
  });
}
