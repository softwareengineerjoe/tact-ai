import { useQuery } from '@tanstack/react-query';

import { projectsService } from '@/services/projectsService';
import type { ApiError } from '@/services/httpClient';
import type { ProjectList, ProjectListParams } from '@/features/projects/types';
import { projectKeys } from './projectKeys';

export function useProjects(params: ProjectListParams) {
  return useQuery<ProjectList, ApiError>({
    queryKey: projectKeys.list(params),
    queryFn: ({ signal }) => projectsService.list(params, signal),
    staleTime: 30_000,
  });
}
