import { cn } from '@/utils/cn';
import type { Ticket } from '@/features/tickets/types';
import {
  TICKET_PRIORITY_LABELS,
  TICKET_TYPE_LABELS,
  isTicketOverdue,
} from '../utils';

interface TicketCardProps {
  ticket: Ticket;
  onOpen: (ticketId: string) => void;
  /** Optional project name shown as an eyebrow on the cross-project board. */
  projectName?: string;
}

const PRIORITY_TONE: Record<Ticket['priority'], string> = {
  low: 'text-fg-muted',
  medium: 'text-fg-body',
  high: 'text-warning',
  critical: 'text-danger',
};

function formatDueDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

/** Presentational board card for a single ticket. Pure. */
export function TicketCard({ ticket, onOpen, projectName }: TicketCardProps) {
  const overdue = isTicketOverdue(ticket);
  return (
    <button
      type='button'
      onClick={() => onOpen(ticket.id)}
      className='group flex h-full w-full flex-col gap-3 rounded-lg border border-border bg-surface p-4 text-left shadow-xs transition-shadow hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover'
    >
      {projectName ? (
        <span className='truncate text-xs font-medium uppercase tracking-wide text-fg-muted'>
          {projectName}
        </span>
      ) : null}

      <span className='text-sm font-semibold leading-snug text-fg group-hover:text-primary'>
        {ticket.title}
      </span>

      <span className='flex flex-wrap items-center gap-2 text-xs'>
        <span className='rounded-sm bg-surface-muted px-1.5 py-0.5 font-medium text-fg-body'>
          {TICKET_TYPE_LABELS[ticket.ticket_type]}
        </span>
        <span className={cn('font-medium', PRIORITY_TONE[ticket.priority])}>
          {TICKET_PRIORITY_LABELS[ticket.priority]}
        </span>
        {ticket.story_points !== null ? (
          <span className='tabular-nums text-fg-muted'>
            {ticket.story_points} pts
          </span>
        ) : null}
        {ticket.due_date ? (
          <span
            className={cn(
              'inline-flex items-center gap-1',
              overdue ? 'font-medium text-danger' : 'text-fg-muted',
            )}
          >
            <span aria-hidden>📅</span>
            {formatDueDate(ticket.due_date)}
            {overdue ? <span className='sr-only'> (overdue)</span> : null}
          </span>
        ) : null}
      </span>

      {ticket.status === 'blocked' && ticket.blocker_reason ? (
        <span className='inline-flex items-start gap-1.5 rounded-sm bg-[#FBECEC] px-2 py-1.5 text-xs text-danger'>
          <span
            aria-hidden
            className='mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-current'
          />
          <span className='line-clamp-2'>{ticket.blocker_reason}</span>
        </span>
      ) : null}

      <span className='mt-auto flex items-center justify-between gap-2 border-t border-border pt-2.5 text-xs'>
        <span className='truncate text-fg-body'>
          {ticket.assignee_name ?? (
            <span className='text-fg-muted'>Unassigned</span>
          )}
        </span>
        {overdue ? (
          <span className='inline-flex shrink-0 items-center gap-1 font-medium text-danger'>
            <span aria-hidden className='h-1.5 w-1.5 rounded-full bg-current' />
            Overdue
          </span>
        ) : null}
      </span>
    </button>
  );
}
