import { cn } from '@/utils/cn';
import type { Ticket } from '@/features/tickets/types';
import { TICKET_PRIORITY_LABELS, TICKET_TYPE_LABELS } from '../utils';

interface TicketCardProps {
  ticket: Ticket;
  onOpen: (ticketId: string) => void;
}

const PRIORITY_TONE: Record<Ticket['priority'], string> = {
  low: 'text-fg-muted',
  medium: 'text-fg-body',
  high: 'text-warning',
  critical: 'text-danger',
};

/** Presentational board card for a single ticket. Pure. */
export function TicketCard({ ticket, onOpen }: TicketCardProps) {
  return (
    <button
      type='button'
      onClick={() => onOpen(ticket.id)}
      className='flex w-full flex-col gap-2 rounded-md border border-border bg-surface p-3 text-left shadow-xs transition-shadow hover:shadow-sm'
    >
      <span className='flex items-center justify-between gap-2'>
        <span className='text-xs font-medium uppercase tracking-wide text-fg-muted'>
          {TICKET_TYPE_LABELS[ticket.ticket_type]}
        </span>
        <span
          className={cn(
            'text-xs font-medium',
            PRIORITY_TONE[ticket.priority],
          )}
        >
          {TICKET_PRIORITY_LABELS[ticket.priority]}
        </span>
      </span>
      <span className='text-sm font-medium text-fg'>{ticket.title}</span>
      <span className='flex items-center justify-between gap-2 text-xs text-fg-muted'>
        <span>{ticket.assignee_name ?? 'Unassigned'}</span>
        {ticket.story_points !== null ? (
          <span className='tabular-nums'>{ticket.story_points} pts</span>
        ) : null}
      </span>
      {ticket.status === 'blocked' && ticket.blocker_reason ? (
        <span className='inline-flex items-center gap-1.5 text-xs text-danger'>
          <span aria-hidden className='h-1.5 w-1.5 rounded-full bg-current' />
          {ticket.blocker_reason}
        </span>
      ) : null}
    </button>
  );
}
