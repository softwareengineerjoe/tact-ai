import { z } from 'zod';

export const NotificationTypeSchema = z.enum([
  'assignment_created',
  'assignment_confirmed',
  'ticket_assigned',
  'ticket_due_soon',
  'ticket_blocked',
  'review_requested',
  'feedback_shared',
  'capacity_conflict',
  'role_unfilled',
  'ai_action_pending',
  'integration_sync_failed',
]);

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  type: NotificationTypeSchema,
  title: z.string(),
  body: z.string().nullable(),
  link: z.string().nullable(),
  is_read: z.boolean(),
  read_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
});

export const NotificationListSchema = z.object({
  items: z.array(NotificationSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  page_size: z.number().int().positive(),
  unread_count: z.number().int().nonnegative(),
});
