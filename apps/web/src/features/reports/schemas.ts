import { z } from 'zod';

import {
  ProjectHealthSchema,
  ProjectProgressSchema,
  ProjectStaffingSchema,
  ProjectStatusSchema,
  ProjectTicketCountsSchema,
} from '@/features/projects/schemas';

const ReportTicketRefSchema = z.object({
  ticket_id: z.string(),
  title: z.string(),
});

export const WeeklyStatusReportSchema = z.object({
  report_type: z.literal('weekly_status'),
  project_id: z.string().uuid(),
  project_name: z.string(),
  status: ProjectStatusSchema,
  summary: z.string(),
  progress: ProjectProgressSchema,
  health: ProjectHealthSchema,
  staffing: ProjectStaffingSchema,
  tickets: ProjectTicketCountsSchema,
  highlights: z.array(z.string()),
  risks: z.array(z.string()),
  blocked_tickets: z.array(ReportTicketRefSchema),
  overdue_tickets: z.array(ReportTicketRefSchema),
  generated_at: z.string().datetime(),
});
