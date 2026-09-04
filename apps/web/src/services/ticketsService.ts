import { request } from '@/services/httpClient';
import {
  TicketCommentSchema,
  TicketDetailSchema,
  TicketListSchema,
  TicketSchema,
} from '@/features/tickets/schemas';
import type {
  AssignTicketInput,
  CommentTicketInput,
  CreateTicketInput,
  TicketListParams,
  TransitionTicketInput,
} from '@/features/tickets/types';

function toQuery(params: TicketListParams): string {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.pageSize) query.set('page_size', String(params.pageSize));
  return query.toString();
}

export const ticketsService = {
  list: (params: TicketListParams, signal?: AbortSignal) =>
    request(`/tickets?${toQuery(params)}`, TicketListSchema, { signal }),

  get: (ticketId: string, signal?: AbortSignal) =>
    request(`/tickets/${ticketId}`, TicketDetailSchema, { signal }),

  create: (input: CreateTicketInput) =>
    request(`/projects/${input.projectId}/tickets`, TicketSchema, {
      method: 'POST',
      headers: { 'Idempotency-Key': crypto.randomUUID() },
      body: JSON.stringify({
        title: input.title,
        description: input.description,
        ticket_type: input.ticketType,
        priority: input.priority,
        assignee_id: input.assigneeId,
        story_points: input.storyPoints,
      }),
    }),

  transition: (input: TransitionTicketInput) =>
    request(`/tickets/${input.ticketId}/transitions`, TicketSchema, {
      method: 'POST',
      body: JSON.stringify({
        status: input.status,
        blocker_reason: input.blockerReason ?? null,
        version: input.version,
      }),
    }),

  assign: (input: AssignTicketInput) =>
    request(`/tickets/${input.ticketId}/assignment`, TicketSchema, {
      method: 'POST',
      body: JSON.stringify({
        assignee_id: input.assigneeId,
        reviewer_id: input.reviewerId,
        version: input.version,
      }),
    }),

  comment: (input: CommentTicketInput) =>
    request(`/tickets/${input.ticketId}/comments`, TicketCommentSchema, {
      method: 'POST',
      body: JSON.stringify({ body: input.body }),
    }),
};
