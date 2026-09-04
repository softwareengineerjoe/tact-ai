import { useMutation, useQueryClient } from '@tanstack/react-query';

import { feedbackService } from '@/services/feedbackService';
import type { ApiError } from '@/services/httpClient';
import type { CreateFeedbackInput, Feedback } from '@/features/feedback/types';
import { feedbackKeys } from './feedbackKeys';

export function useCreateFeedback() {
  const queryClient = useQueryClient();
  return useMutation<Feedback, ApiError, CreateFeedbackInput>({
    mutationFn: (input) => feedbackService.create(input),
    onSuccess: (_data, input) => {
      void queryClient.invalidateQueries({
        queryKey: feedbackKeys.project(input.projectId),
      });
    },
  });
}
