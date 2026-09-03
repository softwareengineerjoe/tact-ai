import { useMutation, useQueryClient } from '@tanstack/react-query';

import { teamService } from '@/services/teamService';
import type { ApiError } from '@/services/httpClient';
import type {
  AssignInput,
  AssignmentCreateResult,
} from '@/features/team-builder/types';
import { teamKeys } from './teamKeys';

export function useAssignEmployee(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation<AssignmentCreateResult, ApiError, AssignInput>({
    mutationFn: (input) => teamService.assign(input),
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
