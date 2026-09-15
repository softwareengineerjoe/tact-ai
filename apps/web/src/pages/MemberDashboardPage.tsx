import { useParams } from 'react-router-dom';

import { PageHeader } from '@/components/shared';
import { MemberDashboardContainer } from '@/features/member-dashboard';

export function MemberDashboardPage() {
  const { employeeId } = useParams<{ employeeId: string }>();

  return (
    <main aria-labelledby='member-dashboard-title'>
      <PageHeader
        id='member-dashboard-title'
        title='Team Member Dashboard'
        description='Assigned work, allocation, deadlines, and shared feedback.'
        backTo={{ to: '/people', label: 'Back to People' }}
      />
      {employeeId ? (
        <MemberDashboardContainer employeeId={employeeId} />
      ) : (
        <p className='text-sm text-fg-muted'>No employee selected.</p>
      )}
    </main>
  );
}
