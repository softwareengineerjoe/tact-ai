import { z } from 'zod';

export const DashboardProjectsSchema = z.object({
  active: z.number().int().nonnegative(),
  awaiting_staffing: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});

export const DashboardTicketsSchema = z.object({
  open: z.number().int().nonnegative(),
  blocked: z.number().int().nonnegative(),
  overdue: z.number().int().nonnegative(),
  in_review: z.number().int().nonnegative(),
});

export const DashboardPeopleSchema = z.object({
  available: z.number().int().nonnegative(),
  fully_allocated: z.number().int().nonnegative(),
  overallocated: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});

export const DashboardSchema = z.object({
  projects: DashboardProjectsSchema,
  tickets: DashboardTicketsSchema,
  people: DashboardPeopleSchema,
  generated_at: z.string().datetime(),
});
