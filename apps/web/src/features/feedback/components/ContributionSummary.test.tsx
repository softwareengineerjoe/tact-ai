import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ContributionSummary } from '@/features/feedback/components/ContributionSummary';
import type { Ticket } from '@/features/tickets/types';

function makeTicket(overrides: Partial<Ticket>): Ticket {
  return {
    id: crypto.randomUUID(),
    organization_id: '00000000-0000-0000-0000-000000000001',
    project_id: '00000000-0000-0000-0000-000000000002',
    title: 'Sample ticket',
    description: null,
    ticket_type: 'task',
    status: 'backlog',
    priority: 'medium',
    assignee_id: null,
    reviewer_id: null,
    story_points: null,
    due_date: null,
    blocker_reason: null,
    version: 0,
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z',
    assignee_name: null,
    reviewer_name: null,
    ...overrides,
  };
}

describe('ContributionSummary', () => {
  it('reports factual counts from tickets', () => {
    const employee = '00000000-0000-0000-0000-0000000000aa';
    const tickets = [
      makeTicket({ status: 'done', assignee_id: employee, story_points: 5 }),
      makeTicket({ status: 'blocked', assignee_id: employee }),
      makeTicket({
        status: 'in_progress',
        assignee_id: employee,
        due_date: '2020-01-01T00:00:00.000Z',
      }),
    ];
    render(<ContributionSummary tickets={tickets} />);

    const completed = screen.getByText('Completed tickets').closest('div');
    expect(completed).toHaveTextContent('1');
    const blocked = screen.getByText('Blocked tickets').closest('div');
    expect(blocked).toHaveTextContent('1');
    const overdue = screen.getByText('Overdue tickets').closest('div');
    expect(overdue).toHaveTextContent('1');
    const points = screen.getByText('Story points completed').closest('div');
    expect(points).toHaveTextContent('5');
  });

  it('does not present a hidden performance score', () => {
    render(<ContributionSummary tickets={[]} />);
    expect(screen.queryByText(/score/i)).not.toBeInTheDocument();
  });
});
