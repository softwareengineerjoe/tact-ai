import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ImportResultView } from '@/features/imports/components/ImportResultView';
import type { ImportJob } from '@/features/imports/types';

function makeJob(overrides?: Partial<ImportJob>): ImportJob {
  return {
    id: '00000000-0000-0000-0000-000000000001',
    kind: 'employees',
    filename: 'employees.csv',
    status: 'completed',
    total_rows: 3,
    created_count: 1,
    updated_count: 1,
    invalid_count: 1,
    error: null,
    created_at: '2026-09-14T08:00:00.000Z',
    rows: [
      { row_number: 1, status: 'created', identifier: 'E1', message: null },
      { row_number: 2, status: 'updated', identifier: 'E2', message: null },
      {
        row_number: 3,
        status: 'invalid',
        identifier: null,
        message: 'employee_code is required.',
      },
    ],
    ...overrides,
  };
}

describe('ImportResultView', () => {
  it('shows the summary counts', () => {
    render(<ImportResultView job={makeJob()} />);

    expect(screen.getByText('Total rows')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Updated')).toBeInTheDocument();
    expect(screen.getByText('Invalid')).toBeInTheDocument();
  });

  it('lists invalid rows with their messages', () => {
    render(<ImportResultView job={makeJob()} />);

    expect(
      screen.getByText(/Row 3: employee_code is required\./),
    ).toBeInTheDocument();
  });

  it('shows an alert when the import failed', () => {
    render(
      <ImportResultView
        job={makeJob({
          status: 'failed',
          error: 'Missing required columns: employee_code',
          rows: [],
        })}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Missing required columns: employee_code',
    );
  });
});
