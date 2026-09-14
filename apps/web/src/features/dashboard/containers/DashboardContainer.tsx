import {
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingState,
} from '@/components/shared';
import { useDashboard } from '../api/useDashboard';
import { DashboardOverview } from '../components/DashboardOverview';

/**
 * Owns the management-overview data lifecycle and renders the standard
 * loading / forbidden / error / empty / success states (MASTER FR-015).
 */
export function DashboardContainer() {
  const { data, isPending, isError, error, refetch } = useDashboard();

  if (isPending) {
    return (
      <LoadingState label='Loading the overview' variant='skeleton' rows={6} />
    );
  }
  if (isError && error.status === 403) {
    return <ForbiddenState requiredPermissions={['reports.view']} />;
  }
  if (isError) {
    return <ErrorState error={error} onRetry={refetch} />;
  }
  if (data.projects.total === 0 && data.people.total === 0) {
    return (
      <EmptyState
        title='Nothing to show yet'
        description='Create a project and add people to see the management overview.'
      />
    );
  }

  return <DashboardOverview data={data} />;
}
