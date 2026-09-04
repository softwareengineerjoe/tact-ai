import type { Ticket } from '@/features/tickets/types';
import { BOARD_COLUMNS, STATUS_LABELS } from '../utils';
import { TicketCard } from './TicketCard';

interface TicketBoardProps {
  tickets: readonly Ticket[];
  onOpen: (ticketId: string) => void;
}

/** Kanban-style board grouping tickets by status (MASTER FR-010, §27). Pure. */
export function TicketBoard({ tickets, onOpen }: TicketBoardProps) {
  return (
    <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
      {BOARD_COLUMNS.map((status) => {
        const columnTickets = tickets.filter((t) => t.status === status);
        return (
          <section
            key={status}
            aria-label={STATUS_LABELS[status]}
            className='flex flex-col gap-2 rounded-lg border border-border bg-surface-muted/40 p-3'
          >
            <header className='flex items-center justify-between gap-2 px-1'>
              <h3 className='text-sm font-semibold text-fg'>
                {STATUS_LABELS[status]}
              </h3>
              <span className='rounded-full bg-surface px-2 py-0.5 text-xs font-medium tabular-nums text-fg-muted'>
                {columnTickets.length}
              </span>
            </header>
            <div className='flex flex-col gap-2'>
              {columnTickets.length === 0 ? (
                <p className='px-1 py-4 text-center text-xs text-fg-muted'>
                  No tickets
                </p>
              ) : (
                columnTickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} onOpen={onOpen} />
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
