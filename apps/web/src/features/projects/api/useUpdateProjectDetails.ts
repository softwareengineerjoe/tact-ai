import { useMutation, useQueryClient } from '@tanstack/react-query';

import { projectsService } from '@/services/projectsService';
import type { ApiError } from '@/services/httpClient';
import type {
  Project,
  UpdateProjectDetailsInput,
} from '@/features/projects/types';
import { projectKeys } from './projectKeys';

export function useUpdateProjectDetails(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation<Project, ApiError, UpdateProjectDetailsInput>({
    mutationFn: (input) => projectsService.updateDetails(projectId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: projectKeys.detail(projectId),
      });
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}
