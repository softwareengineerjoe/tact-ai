import { useMutation, useQueryClient } from '@tanstack/react-query';

import { assistantService } from '@/services/assistantService';
import type { ApiError } from '@/services/httpClient';
import type { ChatMessage } from '@/features/assistant/types';
import { assistantKeys } from './assistantKeys';

interface SendMessageInput {
  sessionId: string;
  content: string;
}

/** Send a question and refresh the conversation with the assistant's reply. */
export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation<ChatMessage, ApiError, SendMessageInput>({
    mutationFn: ({ sessionId, content }) =>
      assistantService.sendMessage(sessionId, content),
    onSuccess: (_data, input) => {
      void queryClient.invalidateQueries({
        queryKey: assistantKeys.session(input.sessionId),
      });
    },
  });
}
