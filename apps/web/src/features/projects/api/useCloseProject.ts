import { useMutation, useQueryClient } from '@tanstack/react-query';

import { projectsService } from '@/services/projectsService';
import type { ApiError } from '@/services/httpClient';
import { projectKeys } from './projectKeys';
import type { ProjectClosure } from '../types';

/**
 * Closes a project and releases its future team allocations (MASTER FR-002).
 * Invalidates the project detail, overview, and lists so the completed status
 * and freed capacity are reflected everywhere.
 */
export function useCloseProject(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation<ProjectClosure, ApiError, void>({
    mutationFn: () => projectsService.close(projectId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}
