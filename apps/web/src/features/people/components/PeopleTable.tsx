import type { Employee } from '@/features/people/types';
import { EmploymentStatusBadge } from './EmploymentStatusBadge';

interface PeopleTableProps {
  employees: readonly Employee[];
  selectedId?: string | null;
  onSelect?: (employee: Employee) => void;
}

/** Presentational directory table. Pure: no data fetching. */
export function PeopleTable({
  employees,
  selectedId,
  onSelect,
}: PeopleTableProps) {
  const isSelectable = onSelect !== undefined;
  return (
    <div className='overflow-hidden rounded-lg border border-border'>
      <table className='w-full text-left text-sm'>
        <thead className='bg-surface-muted text-xs font-medium uppercase tracking-wide text-fg-muted'>
          <tr>
            <th scope='col' className='px-4 py-2.5'>
              Name
            </th>
            <th scope='col' className='px-4 py-2.5'>
              Role
            </th>
            <th scope='col' className='px-4 py-2.5'>
              Department
            </th>
            <th scope='col' className='px-4 py-2.5'>
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => {
            const isSelected = selectedId === employee.id;
            return (
              <tr
                key={employee.id}
                aria-selected={isSelectable ? isSelected : undefined}
                onClick={isSelectable ? () => onSelect(employee) : undefined}
                className={
                  isSelected
                    ? 'border-t border-border bg-primary-subtle'
                    : isSelectable
                      ? 'cursor-pointer border-t border-border bg-surface transition-colors hover:bg-surface-muted'
                      : 'border-t border-border bg-surface'
                }
              >
                <td className='px-4 py-2.5'>
                  {isSelectable ? (
                    <button
                      type='button'
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelect(employee);
                      }}
                      className='text-left font-medium text-fg hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary-hover'
                    >
                      {employee.display_name}
                    </button>
                  ) : (
                    <span className='font-medium text-fg'>
                      {employee.display_name}
                    </span>
                  )}
                  <span className='block text-xs text-fg-muted'>
                    {employee.email}
                  </span>
                </td>
                <td className='px-4 py-2.5 text-fg-body'>
                  {employee.job_title ?? '—'}
                </td>
                <td className='px-4 py-2.5 text-fg-body'>
                  {employee.department ?? '—'}
                </td>
                <td className='px-4 py-2.5'>
                  <EmploymentStatusBadge status={employee.employment_status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
