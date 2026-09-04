import { request } from '@/services/httpClient';
import {
  FeedbackListSchema,
  FeedbackSchema,
} from '@/features/feedback/schemas';
import type {
  AcknowledgeFeedbackInput,
  CreateFeedbackInput,
} from '@/features/feedback/types';

export const feedbackService = {
  listForProject: (projectId: string, signal?: AbortSignal) =>
    request(`/projects/${projectId}/feedback`, FeedbackListSchema, { signal }),

  create: (input: CreateFeedbackInput) =>
    request(`/projects/${input.projectId}/feedback`, FeedbackSchema, {
      method: 'POST',
      headers: { 'Idempotency-Key': crypto.randomUUID() },
      body: JSON.stringify({
        employee_id: input.employeeId,
        category: input.category,
        visibility: input.visibility,
        body: input.body,
      }),
    }),

  acknowledge: (input: AcknowledgeFeedbackInput) =>
    request(`/feedback/${input.feedbackId}/acknowledge`, FeedbackSchema, {
      method: 'POST',
    }),
};
