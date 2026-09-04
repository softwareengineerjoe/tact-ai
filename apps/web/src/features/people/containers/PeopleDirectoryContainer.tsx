import { useState } from 'react';

import {
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingState,
  PermissionGate,
} from '@/components/shared';
import { EmployeeFeedbackContainer } from '@/features/feedback';
import { usePeople } from '@/features/people/api/usePeople';
import { PeopleTable } from '@/features/people/components/PeopleTable';
import type { Employee } from '@/features/people/types';

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
  const [selected, setSelected] = useState<Employee | null>(null);

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

  return (
    <PermissionGate
      permission='feedback.view_shared'
      fallback={<PeopleTable employees={data.items} />}
    >
      <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]'>
        <PeopleTable
          employees={data.items}
          selectedId={selected?.id ?? null}
          onSelect={setSelected}
        />
        <aside
          aria-label='Employee feedback'
          className='space-y-3 lg:sticky lg:top-4 lg:self-start'
        >
          <h2 className='text-sm font-semibold text-fg'>
            {selected ? `Feedback for ${selected.display_name}` : 'Feedback'}
          </h2>
          {selected ? (
            <EmployeeFeedbackContainer
              employeeId={selected.id}
              employeeName={selected.display_name}
            />
          ) : (
            <p className='rounded-lg border border-border bg-surface p-4 text-sm text-fg-muted'>
              Select a person to view the feedback they have received.
            </p>
          )}
        </aside>
      </div>
    </PermissionGate>
  );
}
