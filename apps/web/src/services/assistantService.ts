import { request } from '@/services/httpClient';
import {
  ChatMessageSchema,
  ChatSessionDetailSchema,
  ChatSessionSchema,
} from '@/features/assistant/schemas';

export const assistantService = {
  createSession: (title?: string) =>
    request('/assistant/sessions', ChatSessionSchema, {
      method: 'POST',
      body: JSON.stringify({ title: title ?? null }),
    }),

  getSession: (sessionId: string, signal?: AbortSignal) =>
    request(`/assistant/sessions/${sessionId}`, ChatSessionDetailSchema, {
      signal,
    }),

  sendMessage: (sessionId: string, content: string) =>
    request(`/assistant/sessions/${sessionId}/messages`, ChatMessageSchema, {
      method: 'POST',
      headers: { 'Idempotency-Key': crypto.randomUUID() },
      body: JSON.stringify({ content }),
    }),
};
