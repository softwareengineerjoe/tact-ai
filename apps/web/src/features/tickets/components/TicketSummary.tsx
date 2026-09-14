import { cn } from '@/utils/cn';

interface TicketSummaryProps {
  total: number;
  open: number;
  blocked: number;
  overdue: number;
  done: number;
}

interface Stat {
  label: string;
  value: number;
  tone: 'default' | 'danger';
}

/** Compact at-a-glance stat row for the ticket board. Pure. */
export function TicketSummary({
  total,
  open,
  blocked,
  overdue,
  done,
}: TicketSummaryProps) {
  const stats: Stat[] = [
    { label: 'Total', value: total, tone: 'default' },
    { label: 'Open', value: open, tone: 'default' },
    {
      label: 'Blocked',
      value: blocked,
      tone: blocked > 0 ? 'danger' : 'default',
    },
    {
      label: 'Overdue',
      value: overdue,
      tone: overdue > 0 ? 'danger' : 'default',
    },
    { label: 'Done', value: done, tone: 'default' },
  ];

  return (
    <dl className='flex flex-wrap gap-2'>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className='flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 shadow-xs'
        >
          <dt className='text-xs font-medium text-fg-muted'>{stat.label}</dt>
          <dd
            className={cn(
              'text-sm font-semibold tabular-nums',
              stat.tone === 'danger' && stat.value > 0
                ? 'text-danger'
                : 'text-fg',
            )}
          >
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
