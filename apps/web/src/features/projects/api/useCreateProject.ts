import { useMutation, useQueryClient } from '@tanstack/react-query';

import { projectsService } from '@/services/projectsService';
import type { ApiError } from '@/services/httpClient';
import type { CreateProjectInput, Project } from '@/features/projects/types';
import { projectKeys } from './projectKeys';

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation<Project, ApiError, CreateProjectInput>({
    mutationFn: (input) => projectsService.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}
