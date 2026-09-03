import { useMutation, useQueryClient } from '@tanstack/react-query';

import { requirementsService } from '@/services/requirementsService';
import type { ApiError } from '@/services/httpClient';
import { teamKeys } from '@/features/team-builder/api/teamKeys';

export function useDeleteRequirement(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: (requirementId) => requirementsService.remove(requirementId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: teamKeys.requirements(projectId),
      });
    },
  });
}
