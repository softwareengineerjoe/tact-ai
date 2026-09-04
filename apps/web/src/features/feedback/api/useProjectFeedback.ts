import { useQuery } from '@tanstack/react-query';

import { feedbackService } from '@/services/feedbackService';
import type { ApiError } from '@/services/httpClient';
import type { Feedback } from '@/features/feedback/types';
import { feedbackKeys } from './feedbackKeys';

export function useProjectFeedback(projectId: string) {
  return useQuery<Feedback[], ApiError>({
    queryKey: feedbackKeys.project(projectId),
    queryFn: ({ signal }) => feedbackService.listForProject(projectId, signal),
    staleTime: 15_000,
    enabled: projectId !== '',
  });
}
