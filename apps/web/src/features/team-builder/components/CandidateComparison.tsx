import type { RecommendationCandidate } from '@/features/team-builder/types';
import { FitScoreBadge } from './FitScoreBadge';

interface CandidateComparisonProps {
  candidates: readonly RecommendationCandidate[];
  onClear: () => void;
}

/**
 * Side-by-side comparison of the selected candidates (MASTER FR-007, §27).
 * Presentational and pure: it only reflects the deterministic scores and the
 * matched/missing skills already computed by the backend.
 */
export function CandidateComparison({
  candidates,
  onClear,
}: CandidateComparisonProps) {
  return (
    <div className='rounded-lg border border-border bg-surface p-4'>
      <div className='mb-3 flex items-center justify-between gap-2'>
        <h3 className='text-sm font-semibold text-fg'>
          Comparing {candidates.length} candidates
        </h3>
        <button
          type='button'
          onClick={onClear}
          className='h-8 rounded-md border border-border bg-surface px-3 text-xs font-medium text-fg-body transition-colors hover:bg-surface-muted'
        >
          Clear comparison
        </button>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full min-w-[32rem] text-left text-sm'>
          <thead>
            <tr>
              <th scope='col' className='sr-only'>
                Attribute
              </th>
              {candidates.map((candidate) => (
                <th
                  key={candidate.employee_id}
                  scope='col'
                  className='px-3 py-2 align-bottom text-sm font-semibold text-fg'
                >
                  {candidate.display_name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='align-top'>
            <ComparisonRow label='Fit score'>
              {candidates.map((candidate) => (
                <td key={candidate.employee_id} className='px-3 py-2.5'>
                  <FitScoreBadge score={candidate.project_fit_score} />
                </td>
              ))}
            </ComparisonRow>

            <ComparisonRow label='Remaining capacity'>
              {candidates.map((candidate) => (
                <td
                  key={candidate.employee_id}
                  className='px-3 py-2.5 tabular-nums text-fg-body'
                >
                  {candidate.remaining_capacity_percent}%
                </td>
              ))}
            </ComparisonRow>

            <ComparisonRow label='Matched skills'>
              {candidates.map((candidate) => (
                <td key={candidate.employee_id} className='px-3 py-2.5'>
                  {candidate.matched_skills.length > 0 ? (
                    <div className='flex flex-wrap gap-1'>
                      {candidate.matched_skills.map((skill) => (
                        <span
                          key={skill}
                          className='rounded-sm bg-primary-subtle px-1.5 py-0.5 text-xs font-medium text-primary'
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className='text-xs text-fg-muted'>None</span>
                  )}
                </td>
              ))}
            </ComparisonRow>

            <ComparisonRow label='Missing skills'>
              {candidates.map((candidate) => (
                <td key={candidate.employee_id} className='px-3 py-2.5'>
                  {candidate.missing_skills.length > 0 ? (
                    <div className='flex flex-wrap gap-1'>
                      {candidate.missing_skills.map((skill) => (
                        <span
                          key={skill}
                          className='rounded-sm border border-border px-1.5 py-0.5 text-xs text-fg-muted line-through'
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className='text-xs text-success'>Full coverage</span>
                  )}
                </td>
              ))}
            </ComparisonRow>

            <ComparisonRow label='Supervisor'>
              {candidates.map((candidate) => (
                <td
                  key={candidate.employee_id}
                  className='px-3 py-2.5 text-fg-body'
                >
                  {candidate.supervisor_name ?? (
                    <span className='text-fg-muted'>—</span>
                  )}
                </td>
              ))}
            </ComparisonRow>

            <ComparisonRow label='Warnings'>
              {candidates.map((candidate) => (
                <td key={candidate.employee_id} className='px-3 py-2.5'>
                  {candidate.warnings.length > 0 ? (
                    <ul className='space-y-1'>
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
                  ) : (
                    <span className='text-xs text-success'>None</span>
                  )}
                </td>
              ))}
            </ComparisonRow>
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface ComparisonRowProps {
  label: string;
  children: React.ReactNode;
}

function ComparisonRow({ label, children }: ComparisonRowProps) {
  return (
    <tr className='border-t border-border'>
      <th
        scope='row'
        className='px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-fg-muted'
      >
        {label}
      </th>
      {children}
    </tr>
  );
}
