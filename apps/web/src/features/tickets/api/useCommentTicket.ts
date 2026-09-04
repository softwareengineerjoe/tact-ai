import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ticketsService } from '@/services/ticketsService';
import type { ApiError } from '@/services/httpClient';
import type { CommentTicketInput, TicketComment } from '@/features/tickets/types';
import { ticketKeys } from './ticketKeys';

export function useCommentTicket() {
  const queryClient = useQueryClient();
  return useMutation<TicketComment, ApiError, CommentTicketInput>({
    mutationFn: (input) => ticketsService.comment(input),
    onSuccess: (_comment, input) => {
      void queryClient.invalidateQueries({
        queryKey: ticketKeys.detail(input.ticketId),
      });
    },
  });
}
