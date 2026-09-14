import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { MemberDashboardView } from '@/features/member-dashboard/components/MemberDashboardView';
import type { MemberDashboard } from '@/features/member-dashboard/types';

function makeDashboard(overrides?: Partial<MemberDashboard>): MemberDashboard {
  return {
    employee: {
      id: '00000000-0000-0000-0000-000000000001',
      display_name: 'Maria Santos',
      job_title: 'Backend Developer',
    },
    allocation: {
      confirmed_percent: 60,
      remaining_percent: 40,
      status: 'partially_available',
    },
    projects: [
      {
        project_id: '00000000-0000-0000-0000-000000000002',
        name: 'Project Helios',
        status: 'active',
        allocation_percent: 60,
      },
    ],
    tickets: { open: 4, blocked: 1, overdue: 1, review_requests: 2 },
    upcoming_deadlines: [
      {
        ticket_id: '00000000-0000-0000-0000-000000000003',
        title: 'Build ingestion API',
        due_date: '2026-09-20T00:00:00.000Z',
        project_id: '00000000-0000-0000-0000-000000000002',
      },
    ],
    feedback: { shared_count: 2 },
    generated_at: '2026-09-14T08:00:00.000Z',
    ...overrides,
  };
}

function renderView(data: MemberDashboard) {
  render(
    <MemoryRouter>
      <MemberDashboardView data={data} />
    </MemoryRouter>,
  );
}

describe('MemberDashboardView', () => {
  it('renders work, allocation, and feedback metrics', () => {
    renderView(makeDashboard());

    expect(screen.getByText('Open tickets')).toBeInTheDocument();
    expect(screen.getByText('Review requests')).toBeInTheDocument();
    expect(screen.getByText('Shared feedback')).toBeInTheDocument();
  });

  it('lists assigned projects and upcoming deadlines', () => {
    renderView(makeDashboard());

    expect(
      screen.getByRole('link', { name: 'Project Helios' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Build ingestion API')).toBeInTheDocument();
  });

  it('shows an empty message when there are no projects', () => {
    renderView(makeDashboard({ projects: [] }));

    expect(
      screen.getByText('Not currently assigned to a project.'),
    ).toBeInTheDocument();
  });
});
