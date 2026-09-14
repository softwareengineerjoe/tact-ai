import { useQuery } from '@tanstack/react-query';

import { dashboardService } from '@/services/dashboardService';
import type { ApiError } from '@/services/httpClient';
import type { Dashboard } from '@/features/dashboard/types';
import { dashboardKeys } from './dashboardKeys';

/** Load the management overview counts (MASTER FR-015). */
export function useDashboard() {
  return useQuery<Dashboard, ApiError>({
    queryKey: dashboardKeys.overview(),
    queryFn: ({ signal }) => dashboardService.get(signal),
    staleTime: 30_000,
  });
}
