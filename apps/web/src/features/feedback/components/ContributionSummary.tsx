import type { Ticket } from '@/features/tickets';

interface ContributionSummaryProps {
  tickets: readonly Ticket[];
}

interface Metric {
  label: string;
  value: number;
  source: string;
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

  const source = 'Native tickets';
  return [
    { label: 'Assigned tickets', value: assigned, source },
    { label: 'Completed tickets', value: completed, source },
    { label: 'Story points completed', value: storyPoints, source },
    { label: 'Blocked tickets', value: blocked, source },
    { label: 'Overdue tickets', value: overdue, source },
  ];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** The data window covered by the summary: earliest ticket to today. */
function dataRange(tickets: readonly Ticket[]): string | null {
  const first = tickets[0];
  if (!first) return null;
  const earliest = tickets.reduce(
    (min, t) => (t.created_at < min ? t.created_at : min),
    first.created_at,
  );
  return `${formatDate(earliest)} – ${formatDate(new Date().toISOString())}`;
}

/**
 * Factual project contribution summary (MASTER FR-012).
 * Counts only — never a hidden performance score, never a cross-role ranking.
 * Every metric shows its data source and the summary shows its date range;
 * missing data is made visible rather than assumed.
 */
export function ContributionSummary({ tickets }: ContributionSummaryProps) {
  const metrics = computeMetrics(tickets);
  const range = dataRange(tickets);
  const missingStoryPoints = tickets.some(
    (t) => t.status === 'done' && t.story_points === null,
  );

  return (
    <section
      aria-labelledby='contribution-title'
      className='rounded-lg border border-border bg-surface p-4 shadow-xs'
    >
      <div className='flex flex-wrap items-baseline justify-between gap-2'>
        <h2 id='contribution-title' className='text-sm font-semibold text-fg'>
          Project contribution
        </h2>
        <p className='text-xs text-fg-muted'>
          {range ? `Date range: ${range}` : 'Date range: no data yet'}
        </p>
      </div>
      <dl className='mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5'>
        {metrics.map((metric) => (
          <div key={metric.label} className='rounded-md bg-surface-muted p-3'>
            <dt className='text-xs text-fg-muted'>{metric.label}</dt>
            <dd className='mt-1 text-lg font-semibold tabular-nums text-fg'>
              {metric.value}
            </dd>
            <p className='mt-1 text-[11px] text-fg-muted'>Source: {metric.source}</p>
          </div>
        ))}
      </dl>
      {missingStoryPoints ? (
        <p className='mt-3 text-xs text-warning'>
          Some completed tickets have no story points; the points total is
          incomplete.
        </p>
      ) : null}
      <p className='mt-3 text-xs text-fg-muted'>
        Based on current native ticket data. Counts are not a measure of overall
        productivity and are not comparable across roles (MASTER FR-012).
      </p>
    </section>
  );
}
