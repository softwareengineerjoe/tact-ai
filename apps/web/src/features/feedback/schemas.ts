import { z } from 'zod';

export const FeedbackCategorySchema = z.enum([
  'recognition',
  'strength',
  'improvement_area',
  'coaching',
  'project_contribution',
  'follow_up',
]);

export const FeedbackVisibilitySchema = z.enum([
  'manager_only',
  'manager_and_employee',
  'project_leadership',
  'hr_partner',
]);

export const FeedbackStatusSchema = z.enum([
  'draft',
  'submitted',
  'shared',
  'acknowledged',
  'closed',
]);

export const FeedbackSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  project_id: z.string().uuid(),
  employee_id: z.string().uuid(),
  author_id: z.string().uuid(),
  category: FeedbackCategorySchema,
  visibility: FeedbackVisibilitySchema,
  body: z.string(),
  status: FeedbackStatusSchema,
  version: z.number().int().nonnegative(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  employee_name: z.string().nullable().optional(),
  is_private: z.boolean().optional(),
});

export const FeedbackListSchema = z.array(FeedbackSchema);
