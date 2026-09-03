import { useQuery } from '@tanstack/react-query';

import { teamService } from '@/services/teamService';
import type { ApiError } from '@/services/httpClient';
import type { RoleRequirement } from '@/features/team-builder/types';
import { teamKeys } from './teamKeys';

export function useProjectRequirements(projectId: string) {
  return useQuery<RoleRequirement[], ApiError>({
    queryKey: teamKeys.requirements(projectId),
    queryFn: ({ signal }) => teamService.listRequirements(projectId, signal),
    staleTime: 30_000,
  });
}
