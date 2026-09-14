import { Link } from 'react-router-dom';

import type { ProjectOverview } from '@/features/projects/types';
import { HealthBadge } from './HealthBadge';
import { ProgressBar } from './ProgressBar';

interface ProjectOverviewCardProps {
  overview: ProjectOverview;
}

/** Presentational project health snapshot: progress, health, staffing, tickets. Pure. */
export function ProjectOverviewCard({ overview }: ProjectOverviewCardProps) {
  const { progress, health, staffing, tickets } = overview;
  return (
    <div className='space-y-6'>
      <div className='grid gap-4 md:grid-cols-2'>
        <section className='rounded-lg border border-border bg-surface p-5 shadow-xs'>
          <h2 className='mb-3 text-sm font-semibold text-fg-muted'>Progress</h2>
          <ProgressBar progress={progress} />
        </section>

        <section className='rounded-lg border border-border bg-surface p-5 shadow-xs'>
          <div className='mb-3 flex items-center justify-between gap-2'>
            <h2 className='text-sm font-semibold text-fg-muted'>Health</h2>
            <HealthBadge status={health.status} />
          </div>
          <ul className='space-y-1 text-sm text-fg-body'>
            {health.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby='overview-staffing'>
        <h2
          id='overview-staffing'
          className='mb-3 text-sm font-semibold text-fg-muted'
        >
          Staffing
        </h2>
        <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
          <Metric label='Roles filled' value={staffing.filled_headcount} />
          <Metric label='Roles required' value={staffing.required_headcount} />
          <Metric
            label='Unfilled roles'
            value={staffing.unfilled_roles}
            tone={staffing.unfilled_roles > 0 ? 'warning' : 'default'}
          />
        </div>
      </section>

      <section aria-labelledby='overview-tickets'>
        <div className='mb-3 flex items-center justify-between gap-2'>
          <h2
            id='overview-tickets'
            className='text-sm font-semibold text-fg-muted'
          >
            Tickets
          </h2>
          <Link
            to='/tickets'
            className='text-xs font-medium text-primary hover:underline'
          >
            View board →
          </Link>
        </div>
        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
          <Metric label='Open' value={tickets.open} />
          <Metric
            label='Blocked'
            value={tickets.blocked}
            tone={tickets.blocked > 0 ? 'danger' : 'default'}
          />
          <Metric
            label='Overdue'
            value={tickets.overdue}
            tone={tickets.overdue > 0 ? 'danger' : 'default'}
          />
          <Metric label='Done' value={tickets.done} />
        </div>
      </section>
    </div>
  );
}

type MetricTone = 'default' | 'warning' | 'danger';

const TONE: Record<MetricTone, string> = {
  default: 'text-fg',
  warning: 'text-warning',
  danger: 'text-danger',
};

function Metric({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: number;
  tone?: MetricTone;
}) {
  return (
    <div className='rounded-lg border border-border bg-surface p-4 shadow-xs'>
      <p className='text-sm font-medium text-fg-muted'>{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${TONE[tone]}`}>
        {value}
      </p>
    </div>
  );
}
