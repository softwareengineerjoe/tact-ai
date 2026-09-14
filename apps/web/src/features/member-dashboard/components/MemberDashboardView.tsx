import { Link } from 'react-router-dom';

import { MetricCard } from '@/features/dashboard';
import { ProjectStatusBadge } from '@/features/projects';
import type { MemberDashboard } from '@/features/member-dashboard/types';

interface MemberDashboardViewProps {
  data: MemberDashboard;
}

const ALLOCATION_LABEL: Record<
  MemberDashboard['allocation']['status'],
  string
> = {
  available: 'Available',
  partially_available: 'Partially available',
  fully_allocated: 'Fully allocated',
  overallocated: 'Overallocated',
  unavailable: 'Unavailable',
  unknown: 'Unknown',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

/** Presentational team-member dashboard: work, allocation, feedback (FR-016). Pure. */
export function MemberDashboardView({ data }: MemberDashboardViewProps) {
  const { allocation, projects, tickets, upcoming_deadlines, feedback } = data;
  return (
    <div className='space-y-6'>
      <section aria-labelledby='member-work'>
        <h2
          id='member-work'
          className='mb-3 text-sm font-semibold text-fg-muted'
        >
          My work
        </h2>
        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
          <MetricCard label='Open tickets' value={tickets.open} />
          <MetricCard
            label='Blocked'
            value={tickets.blocked}
            tone={tickets.blocked > 0 ? 'danger' : 'default'}
          />
          <MetricCard
            label='Overdue'
            value={tickets.overdue}
            tone={tickets.overdue > 0 ? 'danger' : 'default'}
          />
          <MetricCard
            label='Review requests'
            value={tickets.review_requests}
            tone={tickets.review_requests > 0 ? 'warning' : 'default'}
          />
        </div>
      </section>

      <section aria-labelledby='member-allocation'>
        <h2
          id='member-allocation'
          className='mb-3 text-sm font-semibold text-fg-muted'
        >
          Allocation
        </h2>
        <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
          <MetricCard
            label='Confirmed'
            value={allocation.confirmed_percent}
            hint={ALLOCATION_LABEL[allocation.status]}
          />
          <MetricCard
            label='Remaining'
            value={allocation.remaining_percent}
            tone={allocation.remaining_percent <= 0 ? 'danger' : 'success'}
            hint='Over the next 90 days'
          />
          <MetricCard label='Shared feedback' value={feedback.shared_count} />
        </div>
      </section>

      <div className='grid gap-6 lg:grid-cols-2'>
        <section aria-labelledby='member-projects'>
          <h2
            id='member-projects'
            className='mb-3 text-sm font-semibold text-fg-muted'
          >
            My projects
          </h2>
          {projects.length === 0 ? (
            <p className='rounded-lg border border-border bg-surface p-4 text-sm text-fg-muted'>
              Not currently assigned to a project.
            </p>
          ) : (
            <ul className='space-y-2'>
              {projects.map((project) => (
                <li
                  key={project.project_id}
                  className='flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4 shadow-xs'
                >
                  <div className='min-w-0'>
                    <Link
                      to={`/projects/${project.project_id}`}
                      className='truncate font-medium text-fg hover:text-primary'
                    >
                      {project.name}
                    </Link>
                    <p className='mt-1'>
                      <ProjectStatusBadge status={project.status} />
                    </p>
                  </div>
                  <span className='shrink-0 text-sm font-semibold tabular-nums text-fg'>
                    {project.allocation_percent}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby='member-deadlines'>
          <h2
            id='member-deadlines'
            className='mb-3 text-sm font-semibold text-fg-muted'
          >
            Upcoming deadlines
          </h2>
          {upcoming_deadlines.length === 0 ? (
            <p className='rounded-lg border border-border bg-surface p-4 text-sm text-fg-muted'>
              No deadlines in the next two weeks.
            </p>
          ) : (
            <ul className='space-y-2'>
              {upcoming_deadlines.map((deadline) => (
                <li
                  key={deadline.ticket_id}
                  className='flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4 shadow-xs'
                >
                  <span className='min-w-0 truncate text-sm text-fg-body'>
                    {deadline.title}
                  </span>
                  <span className='shrink-0 text-xs font-medium text-fg-muted'>
                    {formatDate(deadline.due_date)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
