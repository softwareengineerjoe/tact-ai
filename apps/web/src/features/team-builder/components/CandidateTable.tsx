import { PermissionGate } from '@/components/shared';
import type {
  Assignment,
  RecommendationCandidate,
} from '@/features/team-builder/types';
import { FitScoreBadge } from './FitScoreBadge';

interface CandidateTableProps {
  candidates: readonly RecommendationCandidate[];
  pendingEmployeeId?: string;
  /** Current roster status per employee for the selected role, if any. */
  statusByEmployeeId?: ReadonlyMap<string, Assignment['status']>;
  /** Employee ids currently selected for side-by-side comparison. */
  comparedEmployeeIds?: ReadonlySet<string>;
  onToggleCompare?: (employeeId: string) => void;
  onReserve: (candidate: RecommendationCandidate) => void;
  onAssign: (candidate: RecommendationCandidate) => void;
}

const STATUS_LABELS: Record<string, string> = {
  recommended: 'Recommended',
  reserved: 'Reserved',
  pending_approval: 'Pending approval',
  confirmed: 'Confirmed',
  active: 'Active',
};

// Statuses where the candidate is fully staffed and no further action is needed.
const LOCKED_STATUSES = new Set<Assignment['status']>(['confirmed', 'active']);

/** Presentational candidate comparison table (MASTER §27 wireframe). Pure. */
export function CandidateTable({
  candidates,
  pendingEmployeeId,
  statusByEmployeeId,
  comparedEmployeeIds,
  onToggleCompare,
  onReserve,
  onAssign,
}: CandidateTableProps) {
  const showCompare = onToggleCompare !== undefined;
  return (
    <div className='overflow-hidden rounded-lg border border-border'>
      <table className='w-full text-left text-sm'>
        <thead className='bg-surface-muted text-xs font-medium uppercase tracking-wide text-fg-muted'>
          <tr>
            {showCompare ? (
              <th scope='col' className='px-4 py-2.5'>
                <span className='sr-only'>Compare</span>
              </th>
            ) : null}
            <th scope='col' className='px-4 py-2.5'>
              Candidate
            </th>
            <th scope='col' className='px-4 py-2.5'>
              Fit
            </th>
            <th scope='col' className='px-4 py-2.5'>
              Capacity
            </th>
            <th scope='col' className='px-4 py-2.5'>
              Supervisor
            </th>
            <th scope='col' className='px-4 py-2.5'>
              Skills
            </th>
            <th scope='col' className='px-4 py-2.5 text-right'>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate) => {
            const isPending = pendingEmployeeId === candidate.employee_id;
            const status = statusByEmployeeId?.get(candidate.employee_id);
            const isLocked =
              status !== undefined && LOCKED_STATUSES.has(status);
            const isReservedLike =
              status === 'reserved' || status === 'pending_approval';
            return (
              <tr
                key={candidate.employee_id}
                className='border-t border-border bg-surface align-top'
              >
                {showCompare ? (
                  <td className='px-4 py-3'>
                    <label className='flex items-center gap-2'>
                      <input
                        type='checkbox'
                        checked={
                          comparedEmployeeIds?.has(candidate.employee_id) ??
                          false
                        }
                        onChange={() =>
                          onToggleCompare?.(candidate.employee_id)
                        }
                        className='h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary-hover'
                      />
                      <span className='sr-only'>
                        Compare {candidate.display_name}
                      </span>
                    </label>
                  </td>
                ) : null}
                <td className='px-4 py-3'>
                  <span className='font-medium text-fg'>
                    {candidate.display_name}
                  </span>
                  <span className='mt-1 block max-w-prose text-xs text-fg-muted'>
                    {candidate.recommendation_reason}
                  </span>
                  {candidate.warnings.length > 0 ? (
                    <ul className='mt-1.5 space-y-1'>
                      {candidate.warnings.map((warning) => (
                        <li
                          key={warning}
                          className='inline-flex items-center gap-1.5 text-xs text-warning'
                        >
                          <span
                            aria-hidden
                            className='h-1.5 w-1.5 rounded-full bg-current'
                          />
                          {warning}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </td>
                <td className='px-4 py-3'>
                  <FitScoreBadge score={candidate.project_fit_score} />
                </td>
                <td className='px-4 py-3 tabular-nums text-fg-body'>
                  {candidate.remaining_capacity_percent}%
                </td>
                <td className='px-4 py-3 text-fg-body'>
                  {candidate.supervisor_name ?? (
                    <span className='text-fg-muted'>—</span>
                  )}
                </td>
                <td className='px-4 py-3'>
                  <div className='flex flex-wrap gap-1'>
                    {candidate.matched_skills.map((skill) => (
                      <span
                        key={skill}
                        className='rounded-sm bg-primary-subtle px-1.5 py-0.5 text-xs font-medium text-primary'
                      >
                        {skill}
                      </span>
                    ))}
                    {candidate.missing_skills.map((skill) => (
                      <span
                        key={skill}
                        className='rounded-sm border border-border px-1.5 py-0.5 text-xs text-fg-muted line-through'
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </td>
                <td className='px-4 py-3'>
                  <PermissionGate permission='team.assign'>
                    <div className='flex items-center justify-end gap-2'>
                      {status !== undefined ? (
                        <span
                          className={
                            isLocked
                              ? 'inline-flex items-center gap-1.5 rounded-full bg-primary-subtle px-2.5 py-1 text-xs font-medium text-success'
                              : 'inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-fg-body'
                          }
                        >
                          <span
                            aria-hidden
                            className='h-1.5 w-1.5 rounded-full bg-current'
                          />
                          {STATUS_LABELS[status] ?? status}
                        </span>
                      ) : null}
                      {status === undefined ? (
                        <button
                          type='button'
                          onClick={() => onReserve(candidate)}
                          disabled={isPending}
                          className='h-8 rounded-md border border-border bg-surface px-3 text-xs font-medium text-fg-body transition-colors hover:bg-surface-muted disabled:opacity-50'
                        >
                          Reserve
                        </button>
                      ) : null}
                      {!isLocked ? (
                        <button
                          type='button'
                          onClick={() => onAssign(candidate)}
                          disabled={isPending}
                          className='h-8 rounded-md bg-primary px-3 text-xs font-medium text-primary-fg transition-colors hover:bg-primary-hover disabled:opacity-60'
                        >
                          {isReservedLike ? 'Confirm' : 'Assign'}
                        </button>
                      ) : null}
                    </div>
                  </PermissionGate>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
