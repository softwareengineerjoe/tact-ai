import type { Ticket } from '@/features/tickets';

interface ContributionSummaryProps {
  tickets: readonly Ticket[];
}

interface Metric {
  label: string;
  value: number;
}

function computeMetrics(tickets: readonly Ticket[]): Metric[] {
  const now = Date.now();
  const assigned = tickets.filter((t) => t.assignee_id !== null).length;
  const completed = tickets.filter((t) => t.status === 'done').length;
  const blocked = tickets.filter((t) => t.status === 'blocked').length;
  const overdue = tickets.filter(
    (t) =>
      t.due_date !== null &&
      new Date(t.due_date).getTime() < now &&
      t.status !== 'done' &&
      t.status !== 'cancelled',
  ).length;
  const storyPoints = tickets
    .filter((t) => t.status === 'done')
    .reduce((sum, t) => sum + (t.story_points ?? 0), 0);

  return [
    { label: 'Assigned tickets', value: assigned },
    { label: 'Completed tickets', value: completed },
    { label: 'Story points completed', value: storyPoints },
    { label: 'Blocked tickets', value: blocked },
    { label: 'Overdue tickets', value: overdue },
  ];
}

/**
 * Factual project contribution summary (MASTER FR-012).
 * Counts only — never a hidden performance score, never a cross-role ranking.
 */
export function ContributionSummary({ tickets }: ContributionSummaryProps) {
  const metrics = computeMetrics(tickets);

  return (
    <section
      aria-labelledby='contribution-title'
      className='rounded-lg border border-border bg-surface p-4 shadow-xs'
    >
      <h2 id='contribution-title' className='text-sm font-semibold text-fg'>
        Project contribution
      </h2>
      <dl className='mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5'>
        {metrics.map((metric) => (
          <div key={metric.label} className='rounded-md bg-surface-muted p-3'>
            <dt className='text-xs text-fg-muted'>{metric.label}</dt>
            <dd className='mt-1 text-lg font-semibold tabular-nums text-fg'>
              {metric.value}
            </dd>
          </div>
        ))}
      </dl>
      <p className='mt-3 text-xs text-fg-muted'>
        Based on current native ticket data. Counts are not a measure of overall
        productivity and are not comparable across roles (MASTER FR-012).
      </p>
    </section>
  );
}
