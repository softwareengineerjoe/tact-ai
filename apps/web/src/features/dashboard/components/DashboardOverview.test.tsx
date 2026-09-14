import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DashboardOverview } from '@/features/dashboard/components/DashboardOverview';
import type { Dashboard } from '@/features/dashboard/types';

function makeDashboard(overrides?: Partial<Dashboard>): Dashboard {
  return {
    projects: { active: 2, awaiting_staffing: 1, total: 5 },
    tickets: { open: 4, blocked: 2, overdue: 1, in_review: 3 },
    people: { available: 6, fully_allocated: 2, overallocated: 1, total: 9 },
    generated_at: '2026-09-07T08:00:00.000Z',
    ...overrides,
  };
}

describe('DashboardOverview', () => {
  it('renders the section headings', () => {
    render(<DashboardOverview data={makeDashboard()} />);

    expect(
      screen.getByRole('heading', { name: 'Projects' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Tickets' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'People' })).toBeInTheDocument();
  });

  it('shows the aggregated metric values with labels', () => {
    render(<DashboardOverview data={makeDashboard()} />);

    expect(screen.getByText('Active projects')).toBeInTheDocument();
    expect(screen.getByText('Blocked')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
    // Overallocated value renders.
    expect(screen.getByText('Overallocated')).toBeInTheDocument();
  });
});
