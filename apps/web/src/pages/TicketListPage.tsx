import { EmptyState, PageHeader } from '@/components/shared';

export function TicketListPage() {
  return (
    <main aria-labelledby='tickets-title'>
      <PageHeader id='tickets-title' title='Tickets' />
      <EmptyState
        title='No tickets yet'
        description='Native ticket tracking arrives in Sprint 4.'
      />
    </main>
  );
}
