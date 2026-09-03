import { useMutation, useQueryClient } from '@tanstack/react-query';

import { teamService } from '@/services/teamService';
import type { ApiError } from '@/services/httpClient';
import type { RemoveInput } from '@/features/team-builder/types';
import { teamKeys } from './teamKeys';

export function useRemoveAssignment(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, RemoveInput>({
    mutationFn: (input) => teamService.remove(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: teamKeys.roster(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: [...teamKeys.all, 'recommendations'],
      });
    },
  });
}
