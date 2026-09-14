import { ErrorState, ForbiddenState, LoadingState } from '@/components/shared';
import { useMemberDashboard } from '../api/useMemberDashboard';
import { MemberDashboardView } from '../components/MemberDashboardView';

interface MemberDashboardContainerProps {
  employeeId: string;
}

/**
 * Owns the team-member dashboard lifecycle and renders the standard
 * loading / forbidden / error / success states (MASTER FR-016).
 */
export function MemberDashboardContainer({
  employeeId,
}: MemberDashboardContainerProps) {
  const { data, isPending, isError, error, refetch } =
    useMemberDashboard(employeeId);

  if (isPending) {
    return (
      <LoadingState label='Loading the dashboard' variant='skeleton' rows={5} />
    );
  }
  if (isError && error.status === 403) {
    return <ForbiddenState requiredPermissions={['people.view']} />;
  }
  if (isError) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className='space-y-5'>
      <div>
        <h2 className='text-lg font-semibold text-fg'>
          {data.employee.display_name}
        </h2>
        {data.employee.job_title ? (
          <p className='text-sm text-fg-muted'>{data.employee.job_title}</p>
        ) : null}
      </div>
      <MemberDashboardView data={data} />
    </div>
  );
}
