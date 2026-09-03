import { z } from 'zod';

export const EmploymentStatusSchema = z.enum([
  'active',
  'inactive',
  'on_leave',
  'unavailable',
  'archived',
]);

export const EmployeeSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  employee_code: z.string(),
  display_name: z.string(),
  email: z.string(),
  job_title: z.string().nullable(),
  department: z.string().nullable(),
  primary_role: z.string().nullable(),
  time_zone: z.string().nullable(),
  employment_status: EmploymentStatusSchema,
  version: z.number().int().nonnegative(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const EmployeeListSchema = z.object({
  items: z.array(EmployeeSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  page_size: z.number().int().positive(),
});
