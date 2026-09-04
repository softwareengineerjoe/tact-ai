import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PeopleTable } from '@/features/people/components/PeopleTable';
import type { Employee } from '@/features/people/types';

function makeEmployee(overrides: Partial<Employee>): Employee {
  return {
    id: 'e1',
    organization_id: 'o1',
    employee_code: 'EMP-1',
    display_name: 'Maria Santos',
    email: 'maria@example.com',
    job_title: 'Backend Developer',
    department: 'Engineering',
    primary_role: 'developer',
    time_zone: 'UTC',
    employment_status: 'active',
    version: 0,
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z',
    ...overrides,
  };
}

describe('PeopleTable', () => {
  it('renders rows without selection controls when onSelect is omitted', () => {
    render(<PeopleTable employees={[makeEmployee({})]} />);

    expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('invokes onSelect with the employee when a selectable name is clicked', async () => {
    const onSelect = vi.fn();
    const employee = makeEmployee({ id: 'e2', display_name: 'Daniel Cruz' });
    render(<PeopleTable employees={[employee]} onSelect={onSelect} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Daniel Cruz' }),
    );

    expect(onSelect).toHaveBeenCalledWith(employee);
  });

  it('marks the selected row via aria-selected', () => {
    const employee = makeEmployee({ id: 'e3' });
    render(
      <PeopleTable
        employees={[employee]}
        selectedId='e3'
        onSelect={() => {}}
      />,
    );

    expect(screen.getByRole('row', { selected: true })).toBeInTheDocument();
  });
});
