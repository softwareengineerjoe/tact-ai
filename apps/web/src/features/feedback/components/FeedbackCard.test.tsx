import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SessionContext, type Session } from '@/app/auth/useSession';
import { FeedbackCard } from '@/features/feedback/components/FeedbackCard';
import type { Feedback } from '@/features/feedback/types';

function makeFeedback(overrides: Partial<Feedback>): Feedback {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    organization_id: 'o1',
    project_id: 'p1',
    employee_id: 'e1',
    author_id: 'a1',
    category: 'recognition',
    visibility: 'manager_only',
    body: 'Great work on the API.',
    status: 'submitted',
    version: 0,
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z',
    employee_name: 'Maria Santos',
    is_private: true,
    ...overrides,
  };
}

function renderCard(feedback: Feedback, permissions: string[]) {
  const session: Session = {
    userId: 'u1',
    organizationId: 'o1',
    roles: ['project_manager'],
    permissions: permissions as Session['permissions'],
  };
  return render(
    <SessionContext.Provider value={session}>
      <FeedbackCard
        feedback={feedback}
        isAcknowledging={false}
        onAcknowledge={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    </SessionContext.Provider>,
  );
}

describe('FeedbackCard privacy signals', () => {
  it('marks manager-only feedback as private and blocks acknowledge', () => {
    renderCard(makeFeedback({ visibility: 'manager_only' }), [
      'feedback.acknowledge',
    ]);

    expect(screen.getByText('Manager only')).toBeInTheDocument();
    // Private feedback can never be acknowledged, even with the permission.
    expect(
      screen.queryByRole('button', { name: 'Acknowledge' }),
    ).not.toBeInTheDocument();
  });

  it('allows acknowledging shared feedback when authorized', () => {
    renderCard(
      makeFeedback({
        visibility: 'manager_and_employee',
        is_private: false,
      }),
      ['feedback.acknowledge'],
    );

    expect(screen.getByText('Manager and employee')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Acknowledge' }),
    ).toBeInTheDocument();
  });

  it('hides the Edit action without feedback.edit permission', () => {
    renderCard(makeFeedback({ visibility: 'manager_and_employee' }), []);
    expect(
      screen.queryByRole('button', { name: 'Edit' }),
    ).not.toBeInTheDocument();
  });

  it('shows the Edit action with feedback.edit permission', () => {
    renderCard(makeFeedback({ visibility: 'manager_and_employee' }), [
      'feedback.edit',
    ]);
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });
});
