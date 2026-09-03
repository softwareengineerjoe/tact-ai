import { useMutation, useQueryClient } from '@tanstack/react-query';

import { teamService } from '@/services/teamService';
import type { ApiError } from '@/services/httpClient';
import type { Assignment, ReserveInput } from '@/features/team-builder/types';
import { teamKeys } from './teamKeys';

export function useReserveEmployee(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation<Assignment, ApiError, ReserveInput>({
    mutationFn: (input) => teamService.reserve(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: teamKeys.roster(projectId),
      });
    },
  });
}
