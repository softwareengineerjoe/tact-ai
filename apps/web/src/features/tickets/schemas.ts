import { z } from 'zod';

export const TicketTypeSchema = z.enum([
  'epic',
  'user_story',
  'task',
  'bug',
  'improvement',
  'support_issue',
]);

export const TicketStatusSchema = z.enum([
  'backlog',
  'ready',
  'in_progress',
  'blocked',
  'in_review',
  'done',
  'cancelled',
]);

export const TicketPrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);

export const TicketSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  project_id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  ticket_type: TicketTypeSchema,
  status: TicketStatusSchema,
  priority: TicketPrioritySchema,
  assignee_id: z.string().uuid().nullable(),
  reviewer_id: z.string().uuid().nullable(),
  story_points: z.number().int().nullable(),
  due_date: z.string().datetime().nullable(),
  blocker_reason: z.string().nullable(),
  version: z.number().int().nonnegative(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  assignee_name: z.string().nullable().optional(),
  reviewer_name: z.string().nullable().optional(),
});

export const TicketListSchema = z.object({
  items: z.array(TicketSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  page_size: z.number().int().positive(),
});

export const TicketCommentSchema = z.object({
  id: z.string().uuid(),
  ticket_id: z.string().uuid(),
  author_id: z.string().uuid(),
  body: z.string(),
  created_at: z.string().datetime(),
});

export const TicketActivitySchema = z.object({
  id: z.string().uuid(),
  ticket_id: z.string().uuid(),
  actor_id: z.string().uuid(),
  action: z.string(),
  detail: z.string().nullable(),
  created_at: z.string().datetime(),
});

export const TicketDetailSchema = TicketSchema.extend({
  comments: z.array(TicketCommentSchema),
  activity: z.array(TicketActivitySchema),
});
