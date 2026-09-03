import { PermissionGate } from '@/components/shared';
import type { Assignment } from '@/features/team-builder/types';

interface TeamRosterProps {
  assignments: readonly Assignment[];
  pendingAssignmentId?: string;
  onRemove: (assignment: Assignment) => void;
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
export function TeamRoster({
  assignments,
  pendingAssignmentId,
  onRemove,
}: TeamRosterProps) {
  return (
    <ul className='divide-y divide-border rounded-lg border border-border bg-surface'>
      {assignments.map((assignment) => {
        const isPending = pendingAssignmentId === assignment.id;
        return (
          <li
            key={assignment.id}
            className='flex items-center justify-between gap-3 px-4 py-3 text-sm'
          >
            <div className='min-w-0'>
              <span className='block truncate font-medium text-fg'>
                {assignment.employee_display_name ??
                  assignment.employee_id.slice(0, 8)}
              </span>
              {assignment.supervisor_name ? (
                <span className='block truncate text-xs text-fg-muted'>
                  Supervisor: {assignment.supervisor_name}
                </span>
              ) : null}
            </div>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-primary-subtle px-2.5 py-0.5 text-xs font-medium text-primary'>
              <span
                aria-hidden
                className='h-1.5 w-1.5 rounded-full bg-current'
              />
              {STATUS_LABEL[assignment.status]}
            </span>
            <span className='tabular-nums text-fg-muted'>
              {assignment.allocation_percent}%
            </span>
            <PermissionGate permission='team.remove'>
              <button
                type='button'
                onClick={() => onRemove(assignment)}
                disabled={isPending}
                className='h-8 rounded-md border border-border bg-surface px-3 text-xs font-medium text-danger transition-colors hover:bg-surface-muted disabled:opacity-50'
              >
                Remove
              </button>
            </PermissionGate>
          </li>
        );
      })}
    </ul>
  );
}
