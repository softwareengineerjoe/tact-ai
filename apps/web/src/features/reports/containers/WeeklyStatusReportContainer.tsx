import {
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingState,
} from '@/components/shared';
import { useWeeklyStatusReport } from '../api/useWeeklyStatusReport';
import { WeeklyStatusReportView } from '../components/WeeklyStatusReportView';

interface WeeklyStatusReportContainerProps {
  projectId: string;
}

/**
 * Owns the weekly status report lifecycle and renders the standard
 * loading / forbidden / error / empty / success states (MASTER FR-017).
 */
export function WeeklyStatusReportContainer({
  projectId,
}: WeeklyStatusReportContainerProps) {
  const { data, isPending, isError, error, refetch } =
    useWeeklyStatusReport(projectId);

  if (isPending) {
    return (
      <LoadingState label='Generating the report' variant='skeleton' rows={5} />
    );
  }
  if (isError && error.status === 403) {
    return <ForbiddenState requiredPermissions={['reports.view']} />;
  }
  if (isError) {
    return <ErrorState error={error} onRetry={refetch} />;
  }
  if (data.tickets.total === 0 && data.staffing.required_headcount === 0) {
    return (
      <EmptyState
        title='Nothing to report yet'
        description='Add roles and tickets to this project to generate a status report.'
      />
    );
  }

  return <WeeklyStatusReportView report={data} />;
}
