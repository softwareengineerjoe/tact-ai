import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ticketsService } from '@/services/ticketsService';
import type { ApiError } from '@/services/httpClient';
import type { Ticket, TransitionTicketInput } from '@/features/tickets/types';
import { ticketKeys } from './ticketKeys';

export function useTransitionTicket() {
  const queryClient = useQueryClient();
  return useMutation<Ticket, ApiError, TransitionTicketInput>({
    mutationFn: (input) => ticketsService.transition(input),
    onSuccess: (ticket) => {
      void queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: ticketKeys.detail(ticket.id),
      });
    },
  });
}
