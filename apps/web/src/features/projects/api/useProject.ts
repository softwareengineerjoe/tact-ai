import { useQuery } from '@tanstack/react-query';

import { projectsService } from '@/services/projectsService';
import type { ApiError } from '@/services/httpClient';
import type { Project } from '@/features/projects/types';
import { projectKeys } from './projectKeys';

export function useProject(projectId: string) {
  return useQuery<Project, ApiError>({
    queryKey: projectKeys.detail(projectId),
    queryFn: ({ signal }) => projectsService.get(projectId, signal),
    staleTime: 30_000,
  });
}
