import { demoRoleHeaders, request } from '@/services/httpClient';
import {
  ChatMessageSchema,
  ChatSessionDetailSchema,
  ChatSessionSchema,
} from '@/features/assistant/schemas';
import type { ChatMessage } from '@/features/assistant/types';

interface StreamHandlers {
  /** Called for each streamed text chunk as it arrives. */
  onToken: (text: string) => void;
  /** Called once with the final persisted message (citations, meta, etc.). */
  onDone: (message: ChatMessage) => void;
  onError: (error: Error) => void;
  signal?: AbortSignal;
}

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

  /**
   * Send a message and receive the reply as a Server-Sent Events stream so the
   * UI renders it progressively (MASTER 23, FR-020). Falls back cleanly on any
   * transport error via `onError`.
   */
  async streamMessage(
    sessionId: string,
    content: string,
    handlers: StreamHandlers,
  ): Promise<void> {
    const response = await fetch(
      `/api/v1/assistant/sessions/${sessionId}/messages/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-Id': crypto.randomUUID(),
          'Idempotency-Key': crypto.randomUUID(),
          ...demoRoleHeaders(),
        },
        body: JSON.stringify({ content }),
        signal: handlers.signal,
      },
    );

    if (!response.ok || response.body === null) {
      handlers.onError(new Error('The assistant is unavailable right now.'));
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    // Parse SSE frames (separated by a blank line) as they arrive.
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let separator = buffer.indexOf('\n\n');
      while (separator !== -1) {
        const frame = buffer.slice(0, separator);
        buffer = buffer.slice(separator + 2);
        dispatchFrame(frame, handlers);
        separator = buffer.indexOf('\n\n');
      }
    }
  },
};

function dispatchFrame(frame: string, handlers: StreamHandlers): void {
  let event = 'message';
  let data = '';
  for (const line of frame.split('\n')) {
    if (line.startsWith('event:')) event = line.slice(6).trim();
    else if (line.startsWith('data:')) data += line.slice(5).trim();
  }
  if (data === '') return;

  try {
    if (event === 'token') {
      const parsed = JSON.parse(data) as { text: string };
      handlers.onToken(parsed.text);
    } else if (event === 'done') {
      handlers.onDone(ChatMessageSchema.parse(JSON.parse(data)));
    }
  } catch {
    // Ignore malformed frames; the done event carries the authoritative reply.
  }
}
