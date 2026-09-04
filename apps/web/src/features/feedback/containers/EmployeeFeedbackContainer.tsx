import {
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingState,
} from '@/components/shared';
import { useEmployeeFeedback } from '@/features/feedback/api/useEmployeeFeedback';
import { ReceivedFeedbackList } from '@/features/feedback/components/ReceivedFeedbackList';

interface EmployeeFeedbackContainerProps {
  employeeId: string;
  /** Optional label used in the empty state, e.g. the employee's name. */
  employeeName?: string;
}

/**
 * Owns the data-fetch lifecycle for the feedback an employee received. Reused on
 * the People profile and in the Team Builder so managers see the same, privacy-
 * filtered history in both places (FRONTEND_STANDARDS §13A).
 */
export function EmployeeFeedbackContainer({
  employeeId,
  employeeName,
}: EmployeeFeedbackContainerProps) {
  const { data, isPending, isError, error, refetch } =
    useEmployeeFeedback(employeeId);

  if (isPending)
    return (
      <LoadingState label='Loading feedback' variant='skeleton' rows={2} />
    );
  if (isError && error.status === 403) {
    return <ForbiddenState requiredPermissions={['feedback.view_shared']} />;
  }
  if (isError)
    return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (data.length === 0) {
    return (
      <EmptyState
        title='No feedback yet'
        description={
          employeeName
            ? `${employeeName} has not received any feedback you can view.`
            : 'This employee has not received any feedback you can view.'
        }
      />
    );
  }

  return <ReceivedFeedbackList items={data} />;
}
