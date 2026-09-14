import { z } from 'zod';

const AvailabilityStatusSchema = z.enum([
  'available',
  'partially_available',
  'fully_allocated',
  'overallocated',
  'unavailable',
  'unknown',
]);

const ProjectStatusSchema = z.enum([
  'draft',
  'staffing',
  'ready_for_approval',
  'active',
  'on_hold',
  'closing',
  'completed',
  'archived',
]);

export const MemberEmployeeSchema = z.object({
  id: z.string().uuid(),
  display_name: z.string(),
  job_title: z.string().nullable(),
});

export const MemberAllocationSchema = z.object({
  confirmed_percent: z.number().int(),
  remaining_percent: z.number().int(),
  status: AvailabilityStatusSchema,
});

export const MemberProjectSchema = z.object({
  project_id: z.string().uuid(),
  name: z.string(),
  status: ProjectStatusSchema,
  allocation_percent: z.number().int(),
});

export const MemberTicketCountsSchema = z.object({
  open: z.number().int().nonnegative(),
  blocked: z.number().int().nonnegative(),
  overdue: z.number().int().nonnegative(),
  review_requests: z.number().int().nonnegative(),
});

export const MemberDeadlineSchema = z.object({
  ticket_id: z.string().uuid(),
  title: z.string(),
  due_date: z.string().datetime(),
  project_id: z.string().uuid(),
});

export const MemberFeedbackSchema = z.object({
  shared_count: z.number().int().nonnegative(),
});

export const MemberDashboardSchema = z.object({
  employee: MemberEmployeeSchema,
  allocation: MemberAllocationSchema,
  projects: z.array(MemberProjectSchema),
  tickets: MemberTicketCountsSchema,
  upcoming_deadlines: z.array(MemberDeadlineSchema),
  feedback: MemberFeedbackSchema,
  generated_at: z.string().datetime(),
});
