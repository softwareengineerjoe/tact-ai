import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { ProjectOverviewCard } from '@/features/projects/components/ProjectOverviewCard';
import type { ProjectOverview } from '@/features/projects/types';

function makeOverview(overrides?: Partial<ProjectOverview>): ProjectOverview {
  return {
    project_id: '00000000-0000-0000-0000-000000000001',
    status: 'active',
    progress: { method: 'story_points', completed: 3, total: 4, percent: 75 },
    health: { status: 'amber', reasons: ['One or more tickets are blocked.'] },
    staffing: { required_headcount: 2, filled_headcount: 1, unfilled_roles: 1 },
    tickets: { total: 4, open: 2, blocked: 1, overdue: 0, done: 1 },
    generated_at: '2026-09-14T08:00:00.000Z',
    ...overrides,
  };
}

function renderCard(overview: ProjectOverview) {
  render(
    <MemoryRouter>
      <ProjectOverviewCard overview={overview} />
    </MemoryRouter>,
  );
}

describe('ProjectOverviewCard', () => {
  it('renders the deterministic progress percent and method', () => {
    renderCard(makeOverview());

    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText(/by story points/)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '75',
    );
  });

  it('shows the health label with its reasons', () => {
    renderCard(makeOverview());

    expect(screen.getByText('At risk')).toBeInTheDocument();
    expect(
      screen.getByText('One or more tickets are blocked.'),
    ).toBeInTheDocument();
  });
});
