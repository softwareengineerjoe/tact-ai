import { useQuery } from '@tanstack/react-query';

import { memberDashboardService } from '@/services/memberDashboardService';
import type { ApiError } from '@/services/httpClient';
import type { MemberDashboard } from '@/features/member-dashboard/types';
import { memberDashboardKeys } from './memberDashboardKeys';

/** Load a team member's own dashboard: work, allocation, feedback (MASTER FR-016). */
export function useMemberDashboard(employeeId: string) {
  return useQuery<MemberDashboard, ApiError>({
    queryKey: memberDashboardKeys.detail(employeeId),
    queryFn: ({ signal }) => memberDashboardService.get(employeeId, signal),
    staleTime: 30_000,
    enabled: employeeId !== '',
  });
}
