import { useQuery } from '@tanstack/react-query';

import { ticketsService } from '@/services/ticketsService';
import type { ApiError } from '@/services/httpClient';
import type { TicketList, TicketListParams } from '@/features/tickets/types';
import { ticketKeys } from './ticketKeys';

export function useTickets(params: TicketListParams) {
  return useQuery<TicketList, ApiError>({
    queryKey: ticketKeys.list(params),
    queryFn: ({ signal }) => ticketsService.list(params, signal),
    staleTime: 15_000,
  });
}
