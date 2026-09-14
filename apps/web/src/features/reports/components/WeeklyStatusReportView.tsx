import { HealthBadge, ProgressBar } from '@/features/projects';
import type { WeeklyStatusReport } from '@/features/reports/types';

interface WeeklyStatusReportViewProps {
  report: WeeklyStatusReport;
}

function formatGeneratedAt(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/** Presentational deterministic weekly status report (MASTER FR-017). Pure. */
export function WeeklyStatusReportView({
  report,
}: WeeklyStatusReportViewProps) {
  const {
    project_name,
    summary,
    progress,
    health,
    staffing,
    tickets,
    highlights,
    risks,
    blocked_tickets,
    overdue_tickets,
    generated_at,
  } = report;

  return (
    <article className='space-y-6'>
      <header className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h2 className='text-lg font-semibold text-fg'>{project_name}</h2>
          <p className='text-xs text-fg-muted'>
            Weekly status • generated {formatGeneratedAt(generated_at)}
          </p>
        </div>
        <HealthBadge status={health.status} />
      </header>

      <p className='rounded-lg border border-border bg-surface p-4 text-sm text-fg-body'>
        {summary}
      </p>

      <section aria-labelledby='report-progress'>
        <h3
          id='report-progress'
          className='mb-2 text-sm font-semibold text-fg-muted'
        >
          Progress
        </h3>
        <ProgressBar progress={progress} />
      </section>

      <section aria-labelledby='report-metrics'>
        <h3
          id='report-metrics'
          className='mb-2 text-sm font-semibold text-fg-muted'
        >
          At a glance
        </h3>
        <dl className='grid grid-cols-2 gap-3 md:grid-cols-4'>
          <Metric label='Open tickets' value={tickets.open} />
          <Metric label='Blocked' value={tickets.blocked} />
          <Metric label='Overdue' value={tickets.overdue} />
          <Metric
            label='Roles filled'
            value={`${staffing.filled_headcount}/${staffing.required_headcount}`}
          />
        </dl>
      </section>

      <div className='grid gap-6 lg:grid-cols-2'>
        <ReportList
          id='report-highlights'
          title='Highlights'
          items={highlights}
          empty='No highlights this week.'
        />
        <ReportList
          id='report-risks'
          title='Risks'
          items={risks}
          empty='No risks detected.'
          tone='danger'
        />
      </div>

      {blocked_tickets.length > 0 ? (
        <TicketRefList
          id='report-blocked'
          title='Blocked tickets'
          tickets={blocked_tickets}
        />
      ) : null}
      {overdue_tickets.length > 0 ? (
        <TicketRefList
          id='report-overdue'
          title='Overdue tickets'
          tickets={overdue_tickets}
        />
      ) : null}
    </article>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className='rounded-lg border border-border bg-surface p-3'>
      <dt className='text-xs text-fg-muted'>{label}</dt>
      <dd className='mt-1 text-xl font-semibold tabular-nums text-fg'>
        {value}
      </dd>
    </div>
  );
}

function ReportList({
  id,
  title,
  items,
  empty,
  tone = 'default',
}: {
  id: string;
  title: string;
  items: string[];
  empty: string;
  tone?: 'default' | 'danger';
}) {
  return (
    <section aria-labelledby={id}>
      <h3 id={id} className='mb-2 text-sm font-semibold text-fg-muted'>
        {title}
      </h3>
      {items.length === 0 ? (
        <p className='rounded-lg border border-border bg-surface p-4 text-sm text-fg-muted'>
          {empty}
        </p>
      ) : (
        <ul className='space-y-2'>
          {items.map((item) => (
            <li
              key={item}
              className='flex items-start gap-2 rounded-lg border border-border bg-surface p-3 text-sm text-fg-body'
            >
              <span
                aria-hidden
                className={tone === 'danger' ? 'text-danger' : 'text-primary'}
              >
                {tone === 'danger' ? '▲' : '●'}
              </span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function TicketRefList({
  id,
  title,
  tickets,
}: {
  id: string;
  title: string;
  tickets: WeeklyStatusReport['blocked_tickets'];
}) {
  return (
    <section aria-labelledby={id}>
      <h3 id={id} className='mb-2 text-sm font-semibold text-fg-muted'>
        {title}
      </h3>
      <ul className='space-y-1'>
        {tickets.map((ticket) => (
          <li
            key={ticket.ticket_id}
            className='rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg-body'
          >
            {ticket.title}
          </li>
        ))}
      </ul>
    </section>
  );
}
