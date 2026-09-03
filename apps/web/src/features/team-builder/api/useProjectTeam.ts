import { useQuery } from '@tanstack/react-query';

import { teamService } from '@/services/teamService';
import type { ApiError } from '@/services/httpClient';
import type { Assignment } from '@/features/team-builder/types';
import { teamKeys } from './teamKeys';

export function useProjectTeam(projectId: string) {
  return useQuery<Assignment[], ApiError>({
    queryKey: teamKeys.roster(projectId),
    queryFn: ({ signal }) => teamService.getTeam(projectId, signal),
    staleTime: 15_000,
  });
}
