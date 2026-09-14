import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { WeeklyStatusReportView } from '@/features/reports/components/WeeklyStatusReportView';
import type { WeeklyStatusReport } from '@/features/reports/types';

function makeReport(
  overrides?: Partial<WeeklyStatusReport>,
): WeeklyStatusReport {
  return {
    report_type: 'weekly_status',
    project_id: '00000000-0000-0000-0000-000000000001',
    project_name: 'Project Atlas',
    status: 'active',
    summary: 'Project Atlas is amber at 50% progress with 3 open tickets.',
    progress: { method: 'tickets', completed: 2, total: 4, percent: 50 },
    health: { status: 'amber', reasons: ['One or more tickets are blocked.'] },
    staffing: {
      required_headcount: 3,
      filled_headcount: 2,
      unfilled_roles: 1,
    },
    tickets: { total: 4, open: 3, blocked: 1, overdue: 1, done: 1 },
    highlights: ['Progress at 50%.', 'Completed: Write docs'],
    risks: ['1 role still unfilled.', '1 blocked ticket.'],
    blocked_tickets: [{ ticket_id: 't1', title: 'Fix login' }],
    overdue_tickets: [{ ticket_id: 't2', title: 'Ship API' }],
    generated_at: '2026-09-14T08:00:00.000Z',
    ...overrides,
  };
}

describe('WeeklyStatusReportView', () => {
  it('renders the summary, health, and progress', () => {
    render(<WeeklyStatusReportView report={makeReport()} />);

    expect(screen.getByText(/Project Atlas is amber/)).toBeInTheDocument();
    expect(screen.getByText('At risk')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '50',
    );
  });

  it('lists highlights, risks, and named tickets', () => {
    render(<WeeklyStatusReportView report={makeReport()} />);

    expect(screen.getByText('Completed: Write docs')).toBeInTheDocument();
    expect(screen.getByText('1 blocked ticket.')).toBeInTheDocument();
    expect(screen.getByText('Fix login')).toBeInTheDocument();
    expect(screen.getByText('Ship API')).toBeInTheDocument();
  });
});
