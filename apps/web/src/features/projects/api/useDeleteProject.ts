import { useMutation, useQueryClient } from '@tanstack/react-query';

import { projectsService } from '@/services/projectsService';
import type { ApiError } from '@/services/httpClient';
import { projectKeys } from './projectKeys';

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: (projectId) => projectsService.remove(projectId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}
