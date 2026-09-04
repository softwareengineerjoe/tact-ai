import { useQuery } from '@tanstack/react-query';

import { feedbackService } from '@/services/feedbackService';
import type { ApiError } from '@/services/httpClient';
import type { Feedback } from '@/features/feedback/types';
import { feedbackKeys } from './feedbackKeys';

/** Feedback an employee has received across projects (People profile, Team Builder). */
export function useEmployeeFeedback(employeeId: string) {
  return useQuery<Feedback[], ApiError>({
    queryKey: feedbackKeys.employee(employeeId),
    queryFn: ({ signal }) => feedbackService.listForEmployee(employeeId, signal),
    staleTime: 15_000,
    enabled: employeeId !== '',
  });
}
