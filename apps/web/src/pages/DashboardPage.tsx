import { PageHeader } from '@/components/shared';

export function DashboardPage() {
  return (
    <main aria-labelledby='dashboard-title'>
      <PageHeader
        id='dashboard-title'
        title='Management Overview'
        description='Projects, capacity, and tickets at a glance.'
      />
      <p className='text-sm text-fg-muted'>
        Dashboard widgets arrive in Sprint 6. The foundation is in place.
      </p>
    </main>
  );
}
