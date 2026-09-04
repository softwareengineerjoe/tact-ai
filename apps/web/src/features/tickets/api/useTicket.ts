import { useQuery } from '@tanstack/react-query';

import { ticketsService } from '@/services/ticketsService';
import type { ApiError } from '@/services/httpClient';
import type { TicketDetail } from '@/features/tickets/types';
import { ticketKeys } from './ticketKeys';

export function useTicket(ticketId: string | null) {
  return useQuery<TicketDetail, ApiError>({
    queryKey: ticketKeys.detail(ticketId ?? ''),
    queryFn: ({ signal }) => ticketsService.get(ticketId!, signal),
    enabled: ticketId !== null,
  });
}
