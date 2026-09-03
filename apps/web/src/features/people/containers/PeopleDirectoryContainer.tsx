import {
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingState,
} from '@/components/shared';
import { usePeople } from '@/features/people/api/usePeople';
import { PeopleTable } from '@/features/people/components/PeopleTable';

interface PeopleDirectoryContainerProps {
  search?: string;
  department?: string;
}

/** Owns data + the full data-fetch lifecycle (FRONTEND_STANDARDS §13A). */
export function PeopleDirectoryContainer({
  search,
  department,
}: PeopleDirectoryContainerProps) {
  const { data, isPending, isError, error, refetch } = usePeople({
    search,
    department,
  });

  if (isPending)
    return <LoadingState label='Loading people' variant='skeleton' rows={5} />;
  if (isError && error.status === 403) {
    return <ForbiddenState requiredPermissions={['people.view']} />;
  }
  if (isError)
    return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (data.items.length === 0) {
    return (
      <EmptyState
        title='No people found'
        description='Try adjusting your search or import employee profiles.'
      />
    );
  }

  return <PeopleTable employees={data.items} />;
}
