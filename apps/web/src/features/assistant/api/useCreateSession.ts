import { useMutation } from '@tanstack/react-query';

import { assistantService } from '@/services/assistantService';
import type { ApiError } from '@/services/httpClient';
import type { ChatSession } from '@/features/assistant/types';

/** Start a new conversation. */
export function useCreateSession() {
  return useMutation<ChatSession, ApiError, string | undefined>({
    mutationFn: (title) => assistantService.createSession(title),
  });
}
