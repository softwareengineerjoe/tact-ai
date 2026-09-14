import type { z } from 'zod';

import type {
  MemberAllocationSchema,
  MemberDashboardSchema,
  MemberDeadlineSchema,
  MemberProjectSchema,
} from './schemas';

export type MemberDashboard = z.infer<typeof MemberDashboardSchema>;
export type MemberAllocation = z.infer<typeof MemberAllocationSchema>;
export type MemberProject = z.infer<typeof MemberProjectSchema>;
export type MemberDeadline = z.infer<typeof MemberDeadlineSchema>;
