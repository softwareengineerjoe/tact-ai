import { useMutation, useQueryClient } from '@tanstack/react-query';

import { projectsService } from '@/services/projectsService';
import type { ApiError } from '@/services/httpClient';
import type { Project, UpdateProjectInput } from '@/features/projects/types';
import { projectKeys } from './projectKeys';

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation<Project, ApiError, UpdateProjectInput>({
    mutationFn: (input) => projectsService.update(projectId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: projectKeys.detail(projectId),
      });
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}
