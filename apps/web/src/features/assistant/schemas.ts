import { z } from 'zod';

export const CitationSchema = z.object({
  source_type: z.string(),
  source_id: z.string(),
  label: z.string(),
});

export const MessageRoleSchema = z.enum(['user', 'assistant']);

export const ChatMessageSchema = z.object({
  id: z.string().uuid(),
  role: MessageRoleSchema,
  content: z.string(),
  model_version: z.string().nullish(),
  reasoning_summary: z.string().nullish(),
  warnings: z.array(z.string()).nullish(),
  suggested_next_action: z.string().nullish(),
  citations: z.array(CitationSchema),
  created_at: z.string().datetime(),
});

export const ChatSessionSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  created_at: z.string().datetime(),
});

export const ChatSessionDetailSchema = ChatSessionSchema.extend({
  messages: z.array(ChatMessageSchema),
});

export const ChatSessionListSchema = z.array(ChatSessionSchema);
