import { PageHeader } from '@/components/shared';
import { TicketsContainer } from '@/features/tickets';

export function TicketListPage() {
  return (
    <main aria-labelledby='tickets-title'>
      <PageHeader id='tickets-title' title='Tickets' />
      <TicketsContainer />
    </main>
  );
}
