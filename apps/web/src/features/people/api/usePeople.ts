import { useQuery } from '@tanstack/react-query';

import { peopleService } from '@/services/peopleService';
import type { ApiError } from '@/services/httpClient';
import type { EmployeeList, EmployeeListParams } from '@/features/people/types';
import { peopleKeys } from './peopleKeys';

export function usePeople(params: EmployeeListParams) {
  return useQuery<EmployeeList, ApiError>({
    queryKey: peopleKeys.list(params),
    queryFn: ({ signal }) => peopleService.list(params, signal),
    staleTime: 30_000,
  });
}
