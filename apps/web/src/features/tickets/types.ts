import type { z } from 'zod';

import type {
  TicketActivitySchema,
  TicketCommentSchema,
  TicketDetailSchema,
  TicketListSchema,
  TicketPrioritySchema,
  TicketSchema,
  TicketStatusSchema,
  TicketTypeSchema,
} from './schemas';

export type Ticket = z.infer<typeof TicketSchema>;
export type TicketList = z.infer<typeof TicketListSchema>;
export type TicketDetail = z.infer<typeof TicketDetailSchema>;
export type TicketComment = z.infer<typeof TicketCommentSchema>;
export type TicketActivity = z.infer<typeof TicketActivitySchema>;
export type TicketType = z.infer<typeof TicketTypeSchema>;
export type TicketStatus = z.infer<typeof TicketStatusSchema>;
export type TicketPriority = z.infer<typeof TicketPrioritySchema>;

export interface TicketListParams {
  page?: number;
  pageSize?: number;
}

export interface CreateTicketInput {
  projectId: string;
  title: string;
  description: string | null;
  ticketType: TicketType;
  priority: TicketPriority;
  assigneeId: string | null;
  storyPoints: number | null;
}

export interface TransitionTicketInput {
  ticketId: string;
  status: TicketStatus;
  blockerReason?: string;
  version: number;
}

export interface AssignTicketInput {
  ticketId: string;
  assigneeId: string | null;
  reviewerId: string | null;
  version: number;
}

export interface CommentTicketInput {
  ticketId: string;
  body: string;
}
