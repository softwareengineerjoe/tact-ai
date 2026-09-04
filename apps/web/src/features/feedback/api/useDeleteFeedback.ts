import { useMutation, useQueryClient } from '@tanstack/react-query';

import { feedbackService } from '@/services/feedbackService';
import type { ApiError } from '@/services/httpClient';
import { feedbackKeys } from './feedbackKeys';

interface DeleteFeedbackInput {
  feedbackId: string;
  projectId: string;
  version: number;
}

export function useDeleteFeedback() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, DeleteFeedbackInput>({
    mutationFn: ({ feedbackId, version }) =>
      feedbackService.remove(feedbackId, version),
    onSuccess: (_data, input) => {
      void queryClient.invalidateQueries({
        queryKey: feedbackKeys.project(input.projectId),
      });
    },
  });
}
