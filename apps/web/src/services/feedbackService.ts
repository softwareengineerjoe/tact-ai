import { request, requestVoid } from '@/services/httpClient';
import {
  FeedbackListSchema,
  FeedbackSchema,
} from '@/features/feedback/schemas';
import type {
  AcknowledgeFeedbackInput,
  CreateFeedbackInput,
  UpdateFeedbackInput,
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

  update: (input: UpdateFeedbackInput) =>
    request(`/feedback/${input.feedbackId}`, FeedbackSchema, {
      method: 'PATCH',
      body: JSON.stringify({
        category: input.category,
        visibility: input.visibility,
        body: input.body,
        version: input.version,
      }),
    }),

  acknowledge: (input: AcknowledgeFeedbackInput) =>
    request(`/feedback/${input.feedbackId}/acknowledge`, FeedbackSchema, {
      method: 'POST',
    }),

  remove: (feedbackId: string, version: number) =>
    requestVoid(`/feedback/${feedbackId}?version=${version}`, {
      method: 'DELETE',
    }),
};
