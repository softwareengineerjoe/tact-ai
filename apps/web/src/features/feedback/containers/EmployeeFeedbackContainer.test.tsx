import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { EmployeeFeedbackContainer } from '@/features/feedback/containers/EmployeeFeedbackContainer';
import type { Feedback } from '@/features/feedback/types';
import type { ApiError } from '@/services/httpClient';

const useEmployeeFeedback = vi.fn();

vi.mock('@/features/feedback/api/useEmployeeFeedback', () => ({
  useEmployeeFeedback: (employeeId: string) => useEmployeeFeedback(employeeId),
}));

function makeFeedback(overrides: Partial<Feedback>): Feedback {
  return {
    id: 'f1',
    organization_id: 'o1',
    project_id: 'p1',
    employee_id: 'e1',
    author_id: 'a1',
    category: 'recognition',
    visibility: 'manager_and_employee',
    body: 'Shipped the release.',
    status: 'submitted',
    version: 0,
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z',
    employee_name: 'Maria Santos',
    is_private: false,
    ...overrides,
  };
}

describe('EmployeeFeedbackContainer states', () => {
  it('renders a loading state while pending', () => {
    useEmployeeFeedback.mockReturnValue({ isPending: true, isError: false });
    render(<EmployeeFeedbackContainer employeeId='e1' />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders a forbidden state on 403', () => {
    useEmployeeFeedback.mockReturnValue({
      isPending: false,
      isError: true,
      error: { status: 403 } as ApiError,
    });
    render(<EmployeeFeedbackContainer employeeId='e1' />);
    expect(screen.getByText(/permission/i)).toBeInTheDocument();
  });

  it('renders an error state with retry on failure', () => {
    useEmployeeFeedback.mockReturnValue({
      isPending: false,
      isError: true,
      error: { status: 500, message: 'Boom' } as ApiError,
      refetch: vi.fn(),
    });
    render(<EmployeeFeedbackContainer employeeId='e1' />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /try again/i }),
    ).toBeInTheDocument();
  });

  it('renders an empty state naming the employee when there is no feedback', () => {
    useEmployeeFeedback.mockReturnValue({
      isPending: false,
      isError: false,
      data: [],
    });
    render(
      <EmployeeFeedbackContainer employeeId='e1' employeeName='Maria Santos' />,
    );
    expect(screen.getByText(/Maria Santos/)).toBeInTheDocument();
  });

  it('renders the received feedback on success', () => {
    useEmployeeFeedback.mockReturnValue({
      isPending: false,
      isError: false,
      data: [makeFeedback({})],
    });
    render(<EmployeeFeedbackContainer employeeId='e1' />);
    expect(screen.getByText('Shipped the release.')).toBeInTheDocument();
  });
});
