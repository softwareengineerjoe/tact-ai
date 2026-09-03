import type { z } from 'zod';

import type {
  EmployeeListSchema,
  EmployeeSchema,
  EmploymentStatusSchema,
} from './schemas';

export type Employee = z.infer<typeof EmployeeSchema>;
export type EmployeeList = z.infer<typeof EmployeeListSchema>;
export type EmploymentStatus = z.infer<typeof EmploymentStatusSchema>;

export interface EmployeeListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  department?: string;
  employmentStatus?: EmploymentStatus;
}
