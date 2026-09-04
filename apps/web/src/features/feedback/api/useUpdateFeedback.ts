import { useMutation, useQueryClient } from '@tanstack/react-query';

import { feedbackService } from '@/services/feedbackService';
import type { ApiError } from '@/services/httpClient';
import type { Feedback, UpdateFeedbackInput } from '@/features/feedback/types';
import { feedbackKeys } from './feedbackKeys';

export function useUpdateFeedback() {
  const queryClient = useQueryClient();
  return useMutation<Feedback, ApiError, UpdateFeedbackInput>({
    mutationFn: (input) => feedbackService.update(input),
    onSuccess: (_data, input) => {
      void queryClient.invalidateQueries({
        queryKey: feedbackKeys.project(input.projectId),
      });
    },
  });
}
