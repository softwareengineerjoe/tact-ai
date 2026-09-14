import { useQuery } from '@tanstack/react-query';

import { projectsService } from '@/services/projectsService';
import type { ApiError } from '@/services/httpClient';
import type { ProjectOverview } from '@/features/projects/types';
import { projectKeys } from './projectKeys';

/** Load a project's progress + health snapshot (MASTER FR-013, FR-014). */
export function useProjectOverview(projectId: string) {
  return useQuery<ProjectOverview, ApiError>({
    queryKey: projectKeys.overview(projectId),
    queryFn: ({ signal }) => projectsService.getOverview(projectId, signal),
    staleTime: 30_000,
    enabled: projectId !== '',
  });
}
