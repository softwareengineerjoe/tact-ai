import type { Employee } from '@/features/people/types';
import { EmploymentStatusBadge } from './EmploymentStatusBadge';

interface PeopleTableProps {
  employees: readonly Employee[];
}

/** Presentational directory table. Pure: no data fetching. */
export function PeopleTable({ employees }: PeopleTableProps) {
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
          {employees.map((employee) => (
            <tr key={employee.id} className='border-t border-border bg-surface'>
              <td className='px-4 py-2.5'>
                <span className='font-medium text-fg'>
                  {employee.display_name}
                </span>
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
