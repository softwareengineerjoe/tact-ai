import { PageHeader } from '@/components/shared';
import { DashboardIcon } from '@/components/icons';
import { DashboardContainer } from '@/features/dashboard';

export function DashboardPage() {
  return (
    <main aria-labelledby='dashboard-title'>
      <PageHeader
        id='dashboard-title'
        eyebrow='Overview'
        icon={<DashboardIcon className='h-5 w-5' />}
        title='Management Overview'
        description='Projects, capacity, and tickets at a glance.'
      />
      <DashboardContainer />
    </main>
  );
}
