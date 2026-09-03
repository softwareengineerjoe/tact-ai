import { useMutation, useQueryClient } from '@tanstack/react-query';

import { requirementsService } from '@/services/requirementsService';
import type { ApiError } from '@/services/httpClient';
import { teamKeys } from '@/features/team-builder/api/teamKeys';
import type { RoleRequirement } from '@/features/team-builder/types';
import type { CreateRequirementInput } from '@/features/requirements/types';

export function useCreateRequirement(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation<RoleRequirement, ApiError, CreateRequirementInput>({
    mutationFn: (input) => requirementsService.create(projectId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: teamKeys.requirements(projectId),
      });
    },
  });
}
