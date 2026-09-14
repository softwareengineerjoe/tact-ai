import { cn } from '@/utils/cn';
import type { Ticket } from '@/features/tickets/types';
import {
  BOARD_COLUMNS,
  PRIORITY_ORDER,
  STATUS_DOT,
  STATUS_LABELS,
} from '../utils';
import { TicketCard } from './TicketCard';

interface TicketBoardProps {
  tickets: readonly Ticket[];
  onOpen: (ticketId: string) => void;
  /** Lookup of project id → name for the cross-project board eyebrow. */
  projectNames?: Record<string, string>;
}

/** Status-grouped ticket list (MASTER FR-010, §27). Vertical + scannable. Pure. */
export function TicketBoard({
  tickets,
  onOpen,
  projectNames = {},
}: TicketBoardProps) {
  const groups = BOARD_COLUMNS.map((status) => ({
    status,
    tickets: tickets
      .filter((t) => t.status === status)
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]),
  })).filter((group) => group.tickets.length > 0);

  return (
    <div className='flex flex-col gap-6'>
      {groups.map(({ status, tickets: columnTickets }) => (
        <section key={status} aria-label={STATUS_LABELS[status]}>
          <header className='mb-2 flex items-center gap-2'>
            <span
              aria-hidden
              className={cn('h-2.5 w-2.5 rounded-full', STATUS_DOT[status])}
            />
            <h3 className='text-sm font-semibold text-fg'>
              {STATUS_LABELS[status]}
            </h3>
            <span className='rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium tabular-nums text-fg-muted'>
              {columnTickets.length}
            </span>
          </header>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {columnTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onOpen={onOpen}
                projectName={projectNames[ticket.project_id]}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
