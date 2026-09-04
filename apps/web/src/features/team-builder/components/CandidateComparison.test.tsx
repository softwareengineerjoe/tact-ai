import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CandidateComparison } from '@/features/team-builder/components/CandidateComparison';
import type { RecommendationCandidate } from '@/features/team-builder/types';

function makeCandidate(
  overrides: Partial<RecommendationCandidate>,
): RecommendationCandidate {
  return {
    employee_id: '11111111-1111-1111-1111-111111111111',
    display_name: 'Maria Santos',
    role_requirement_id: '22222222-2222-2222-2222-222222222222',
    project_fit_score: 91,
    matched_skills: ['Python', 'FastAPI'],
    missing_skills: [],
    remaining_capacity_percent: 100,
    data_freshness: '2026-09-01T08:00:00.000Z',
    warnings: [],
    recommendation_reason: 'Strong coverage.',
    supervisor_name: 'Elena Vasquez',
    ...overrides,
  };
}

const maria = makeCandidate({});
const daniel = makeCandidate({
  employee_id: '33333333-3333-3333-3333-333333333333',
  display_name: 'Daniel Cruz',
  project_fit_score: 74,
  matched_skills: ['Python'],
  missing_skills: ['FastAPI'],
  remaining_capacity_percent: 30,
  warnings: ['Low capacity'],
});

describe('CandidateComparison', () => {
  it('shows each compared candidate as a column with their scores', () => {
    render(<CandidateComparison candidates={[maria, daniel]} onClear={() => {}} />);

    expect(screen.getByText('Comparing 2 candidates')).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Maria Santos' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Daniel Cruz' }),
    ).toBeInTheDocument();
    expect(screen.getByText('91')).toBeInTheDocument();
    expect(screen.getByText('74')).toBeInTheDocument();
  });

  it('surfaces matched, missing skills, and warnings', () => {
    render(<CandidateComparison candidates={[maria, daniel]} onClear={() => {}} />);

    // FastAPI appears as Maria's matched skill and Daniel's missing skill.
    expect(screen.getAllByText('FastAPI')).toHaveLength(2);
    expect(screen.getByText('Low capacity')).toBeInTheDocument();
    expect(screen.getByText('Full coverage')).toBeInTheDocument();
  });

  it('clears the comparison when requested', async () => {
    const onClear = vi.fn();
    render(<CandidateComparison candidates={[maria, daniel]} onClear={onClear} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Clear comparison' }),
    );

    expect(onClear).toHaveBeenCalledOnce();
  });
});
