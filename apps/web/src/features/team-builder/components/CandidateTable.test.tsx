import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SessionContext, type Session } from '@/app/auth/useSession';
import { CandidateTable } from '@/features/team-builder/components/CandidateTable';
import type { RecommendationCandidate } from '@/features/team-builder/types';

const candidate: RecommendationCandidate = {
  employee_id: '11111111-1111-1111-1111-111111111111',
  display_name: 'Maria Santos',
  role_requirement_id: '22222222-2222-2222-2222-222222222222',
  project_fit_score: 91,
  matched_skills: ['Python', 'FastAPI'],
  missing_skills: ['Azure'],
  remaining_capacity_percent: 100,
  data_freshness: '2026-09-01T08:00:00.000Z',
  warnings: [],
  recommendation_reason: 'Strong required-skill coverage.',
  supervisor_name: 'Elena Vasquez',
};

interface RenderOptions {
  onToggleCompare?: (employeeId: string) => void;
}

function renderWithSession(permissions: string[], options: RenderOptions = {}) {
  const session: Session = {
    userId: 'u1',
    organizationId: 'o1',
    roles: ['project_manager'],
    permissions: permissions as Session['permissions'],
  };
  return render(
    <SessionContext.Provider value={session}>
      <CandidateTable
        candidates={[candidate]}
        onReserve={() => {}}
        onAssign={() => {}}
        onToggleCompare={options.onToggleCompare}
      />
    </SessionContext.Provider>,
  );
}

describe('CandidateTable', () => {
  it('renders the candidate, fit score, and skills', () => {
    renderWithSession(['team.assign']);

    expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    expect(screen.getByText('91')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('Azure')).toBeInTheDocument();
  });

  it('shows the Assign action when authorized', () => {
    renderWithSession(['team.assign']);
    expect(screen.getByRole('button', { name: 'Assign' })).toBeInTheDocument();
  });

  it('hides the Assign action when not authorized', () => {
    renderWithSession(['projects.view']);
    expect(
      screen.queryByRole('button', { name: 'Assign' }),
    ).not.toBeInTheDocument();
  });

  it('toggles a candidate for comparison when the checkbox is clicked', async () => {
    const onToggleCompare = vi.fn();
    renderWithSession(['team.assign'], { onToggleCompare });

    await userEvent.click(
      screen.getByRole('checkbox', { name: /Compare Maria Santos/ }),
    );

    expect(onToggleCompare).toHaveBeenCalledWith(candidate.employee_id);
  });

  it('omits the compare column when comparison is disabled', () => {
    renderWithSession(['team.assign']);
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
});
