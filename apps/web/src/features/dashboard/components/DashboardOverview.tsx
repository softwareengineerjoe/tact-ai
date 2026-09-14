import type { Dashboard } from '@/features/dashboard/types';
import { MetricCard } from './MetricCard';

interface DashboardOverviewProps {
  data: Dashboard;
}

/** Presentational grid of management overview metrics (MASTER FR-015). */
export function DashboardOverview({ data }: DashboardOverviewProps) {
  const { projects, tickets, people } = data;
  return (
    <div className='space-y-6'>
      <section aria-labelledby='dashboard-projects-title'>
        <h2
          id='dashboard-projects-title'
          className='mb-3 text-sm font-semibold text-fg-muted'
        >
          Projects
        </h2>
        <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
          <MetricCard label='Active projects' value={projects.active} />
          <MetricCard
            label='Awaiting staffing'
            value={projects.awaiting_staffing}
            tone={projects.awaiting_staffing > 0 ? 'warning' : 'default'}
            hint='Staffing or approval pending'
          />
          <MetricCard label='Total projects' value={projects.total} />
        </div>
      </section>

      <section aria-labelledby='dashboard-tickets-title'>
        <h2
          id='dashboard-tickets-title'
          className='mb-3 text-sm font-semibold text-fg-muted'
        >
          Tickets
        </h2>
        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
          <MetricCard label='Open' value={tickets.open} />
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
            label='In review'
            value={tickets.in_review}
            tone={tickets.in_review > 0 ? 'warning' : 'default'}
          />
        </div>
      </section>

      <section aria-labelledby='dashboard-people-title'>
        <h2
          id='dashboard-people-title'
          className='mb-3 text-sm font-semibold text-fg-muted'
        >
          People
        </h2>
        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
          <MetricCard
            label='Available'
            value={people.available}
            tone={people.available > 0 ? 'success' : 'default'}
            hint='Over the next 90 days'
          />
          <MetricCard label='Fully allocated' value={people.fully_allocated} />
          <MetricCard
            label='Overallocated'
            value={people.overallocated}
            tone={people.overallocated > 0 ? 'danger' : 'default'}
          />
          <MetricCard label='Total people' value={people.total} />
        </div>
      </section>
    </div>
  );
}
