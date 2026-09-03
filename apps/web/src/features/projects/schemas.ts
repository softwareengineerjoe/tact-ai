import { z } from 'zod';

export const ProjectStatusSchema = z.enum([
  'draft',
  'staffing',
  'ready_for_approval',
  'active',
  'on_hold',
  'closing',
  'completed',
  'archived',
]);

export const ProjectPrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);

export const TicketProviderSchema = z.enum(['native', 'jira', 'azure_devops']);

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  business_objective: z.string().nullable(),
  priority: ProjectPrioritySchema,
  status: ProjectStatusSchema,
  manager_id: z.string().uuid().nullable(),
  start_date: z.string().datetime().nullable(),
  target_end_date: z.string().datetime().nullable(),
  ticket_provider: TicketProviderSchema,
  expected_team_size: z.number().int().nullable(),
  version: z.number().int().nonnegative(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const ProjectListSchema = z.object({
  items: z.array(ProjectSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  page_size: z.number().int().positive(),
});

export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(200),
  description: z.string().optional(),
  business_objective: z.string().optional(),
  priority: ProjectPrioritySchema.default('medium'),
});
