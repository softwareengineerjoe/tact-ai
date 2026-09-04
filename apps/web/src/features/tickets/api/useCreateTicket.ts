import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ticketsService } from '@/services/ticketsService';
import type { ApiError } from '@/services/httpClient';
import type { CreateTicketInput, Ticket } from '@/features/tickets/types';
import { ticketKeys } from './ticketKeys';

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation<Ticket, ApiError, CreateTicketInput>({
    mutationFn: (input) => ticketsService.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
    },
  });
}
