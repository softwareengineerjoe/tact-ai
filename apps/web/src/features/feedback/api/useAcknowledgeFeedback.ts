import { useMutation, useQueryClient } from '@tanstack/react-query';

import { feedbackService } from '@/services/feedbackService';
import type { ApiError } from '@/services/httpClient';
import type {
  AcknowledgeFeedbackInput,
  Feedback,
} from '@/features/feedback/types';
import { feedbackKeys } from './feedbackKeys';

export function useAcknowledgeFeedback() {
  const queryClient = useQueryClient();
  return useMutation<Feedback, ApiError, AcknowledgeFeedbackInput>({
    mutationFn: (input) => feedbackService.acknowledge(input),
    onSuccess: (_data, input) => {
      void queryClient.invalidateQueries({
        queryKey: feedbackKeys.project(input.projectId),
      });
    },
  });
}
