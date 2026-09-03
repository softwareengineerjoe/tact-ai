import type { Assignment } from '@/features/team-builder/types';

interface TeamRosterProps {
  assignments: readonly Assignment[];
}

const STATUS_LABEL: Record<Assignment['status'], string> = {
  recommended: 'Recommended',
  reserved: 'Reserved',
  pending_approval: 'Pending approval',
  confirmed: 'Confirmed',
  active: 'Active',
  ended: 'Ended',
  rejected: 'Rejected',
  expired: 'Expired',
  declined: 'Declined',
  cancelled: 'Cancelled',
};

/** Presentational current-team roster. Pure: no data fetching. */
export function TeamRoster({ assignments }: TeamRosterProps) {
  return (
    <ul className='divide-y divide-border rounded-lg border border-border bg-surface'>
      {assignments.map((assignment) => (
        <li
          key={assignment.id}
          className='flex items-center justify-between gap-3 px-4 py-3 text-sm'
        >
          <span className='font-medium text-fg'>
            {assignment.employee_id.slice(0, 8)}
          </span>
          <span className='inline-flex items-center gap-1.5 rounded-full bg-primary-subtle px-2.5 py-0.5 text-xs font-medium text-primary'>
            <span aria-hidden className='h-1.5 w-1.5 rounded-full bg-current' />
            {STATUS_LABEL[assignment.status]}
          </span>
          <span className='tabular-nums text-fg-muted'>
            {assignment.allocation_percent}%
          </span>
        </li>
      ))}
    </ul>
  );
}
