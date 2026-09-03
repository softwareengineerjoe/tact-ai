import type { EmployeeListParams } from '@/features/people/types';

export const peopleKeys = {
  all: ['people'] as const,
  lists: () => [...peopleKeys.all, 'list'] as const,
  list: (params: EmployeeListParams) => [...peopleKeys.lists(), params] as const,
  details: () => [...peopleKeys.all, 'detail'] as const,
  detail: (id: string) => [...peopleKeys.details(), id] as const,
};
