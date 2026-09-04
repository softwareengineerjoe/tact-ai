import { useQuery } from '@tanstack/react-query';

import { assistantService } from '@/services/assistantService';
import type { ApiError } from '@/services/httpClient';
import type { ChatSessionDetail } from '@/features/assistant/types';
import { assistantKeys } from './assistantKeys';

/** Load one conversation with its full message history. */
export function useAssistantSession(sessionId: string) {
  return useQuery<ChatSessionDetail, ApiError>({
    queryKey: assistantKeys.session(sessionId),
    queryFn: ({ signal }) => assistantService.getSession(sessionId, signal),
    enabled: sessionId !== '',
    staleTime: 5_000,
  });
}
