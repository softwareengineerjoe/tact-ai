import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EmptyState } from '@/components/shared';

describe('EmptyState', () => {
  it('renders the title and description', () => {
    render(
      <EmptyState title='No projects yet' description='Create one to start.' />,
    );

    expect(
      screen.getByRole('heading', { name: 'No projects yet' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Create one to start.')).toBeInTheDocument();
  });
});
