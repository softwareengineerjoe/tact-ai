import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProjectStatusBadge } from './ProjectStatusBadge';

describe('ProjectStatusBadge', () => {
  it('renders a text label (never color alone)', () => {
    render(<ProjectStatusBadge status='active' />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('maps each status to its human label', () => {
    render(<ProjectStatusBadge status='ready_for_approval' />);
    expect(screen.getByText('Ready for approval')).toBeInTheDocument();
  });
});
