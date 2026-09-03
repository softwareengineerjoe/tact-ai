import { useMutation, useQueryClient } from '@tanstack/react-query';

import { requirementsService } from '@/services/requirementsService';
import type { ApiError } from '@/services/httpClient';
import { teamKeys } from '@/features/team-builder/api/teamKeys';
import type { RoleRequirement } from '@/features/team-builder/types';
import type { UpdateRequirementInput } from '@/features/requirements/types';

export function useUpdateRequirement(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation<RoleRequirement, ApiError, UpdateRequirementInput>({
    mutationFn: (input) => requirementsService.update(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: teamKeys.requirements(projectId),
      });
    },
  });
}
