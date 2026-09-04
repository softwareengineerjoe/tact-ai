import type { z } from 'zod';

import type {
  ChatMessageSchema,
  ChatSessionSchema,
  ChatSessionDetailSchema,
  CitationSchema,
} from './schemas';

export type Citation = z.infer<typeof CitationSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatSession = z.infer<typeof ChatSessionSchema>;
export type ChatSessionDetail = z.infer<typeof ChatSessionDetailSchema>;
