import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TicketBoard } from '@/features/tickets/components/TicketBoard';
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

describe('TicketBoard', () => {
  it('groups tickets under their status columns', () => {
    const tickets = [
      makeTicket({ title: 'Backlog item', status: 'backlog' }),
      makeTicket({ title: 'Doing it', status: 'in_progress' }),
    ];
    render(<TicketBoard tickets={tickets} onOpen={() => {}} />);

    expect(screen.getByText('Backlog item')).toBeInTheDocument();
    expect(screen.getByText('Doing it')).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'In progress' }),
    ).toBeInTheDocument();
  });

  it('opens a ticket when its card is clicked', async () => {
    const onOpen = vi.fn();
    const ticket = makeTicket({ title: 'Click me' });
    render(<TicketBoard tickets={[ticket]} onOpen={onOpen} />);

    screen.getByText('Click me').click();
    expect(onOpen).toHaveBeenCalledWith(ticket.id);
  });
});
