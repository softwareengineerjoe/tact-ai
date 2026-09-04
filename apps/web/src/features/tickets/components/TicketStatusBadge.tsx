import { cn } from '@/utils/cn';
import type { TicketStatus } from '@/features/tickets/types';

interface TicketStatusBadgeProps {
  status: TicketStatus;
  className?: string;
}

const STATUS_META: Record<TicketStatus, { label: string; tone: string }> = {
  backlog: { label: 'Backlog', tone: 'bg-surface-muted text-fg-muted' },
  ready: { label: 'Ready', tone: 'bg-surface-muted text-fg-body' },
  in_progress: { label: 'In progress', tone: 'bg-primary-subtle text-primary' },
  blocked: { label: 'Blocked', tone: 'bg-[#FBECEC] text-danger' },
  in_review: { label: 'In review', tone: 'bg-[#FBF3E0] text-warning' },
  done: { label: 'Done', tone: 'bg-primary-subtle text-success' },
  cancelled: { label: 'Cancelled', tone: 'bg-surface-muted text-fg-muted' },
};

/** Ticket status pill — always pairs a dot + text, never color alone. */
export function TicketStatusBadge({ status, className }: TicketStatusBadgeProps) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        meta.tone,
        className,
      )}
    >
      <span aria-hidden className='h-1.5 w-1.5 rounded-full bg-current' />
      {meta.label}
    </span>
  );
}
