import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ReceivedFeedbackList } from '@/features/feedback/components/ReceivedFeedbackList';
import type { Feedback } from '@/features/feedback/types';

function makeFeedback(overrides: Partial<Feedback>): Feedback {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    organization_id: 'o1',
    project_id: 'p1',
    employee_id: 'e1',
    author_id: 'a1',
    category: 'recognition',
    visibility: 'manager_and_employee',
    body: 'Great work on the API.',
    status: 'submitted',
    version: 0,
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z',
    employee_name: 'Maria Santos',
    is_private: false,
    ...overrides,
  };
}

describe('ReceivedFeedbackList', () => {
  it('renders each entry with its category, body, and visibility', () => {
    render(
      <ReceivedFeedbackList
        items={[
          makeFeedback({ id: 'a', body: 'Shipped the release.' }),
          makeFeedback({
            id: 'b',
            body: 'Mentored two juniors.',
            category: 'coaching',
            visibility: 'manager_only',
          }),
        ]}
      />,
    );

    expect(screen.getByText('Shipped the release.')).toBeInTheDocument();
    expect(screen.getByText('Mentored two juniors.')).toBeInTheDocument();
    expect(screen.getByText('Recognition')).toBeInTheDocument();
    expect(screen.getByText('Coaching')).toBeInTheDocument();
    expect(screen.getByText('Manager only')).toBeInTheDocument();
  });

  it('exposes no edit, delete, or acknowledge actions (read-only)', () => {
    render(<ReceivedFeedbackList items={[makeFeedback({ id: 'a' })]} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
