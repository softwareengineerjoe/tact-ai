import { PageHeader } from '@/components/shared';
import { TicketIcon } from '@/components/icons';
import { TicketsContainer } from '@/features/tickets';

export function TicketListPage() {
  return (
    <main aria-labelledby='tickets-title'>
      <PageHeader
        id='tickets-title'
        icon={<TicketIcon className='h-5 w-5' />}
        title='Tickets'
        description='Track work across your authorized projects.'
      />
      <TicketsContainer />
    </main>
  );
}
