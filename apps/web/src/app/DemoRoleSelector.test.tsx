import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DemoRoleSelector } from '@/app/DemoRoleSelector';
import { getActiveDemoRole } from '@/app/auth/demoRole';

describe('DemoRoleSelector', () => {
  beforeEach(() => {
    localStorage.clear();
    // window.location.reload is not implemented in jsdom; stub it.
    vi.stubGlobal('location', { ...window.location, reload: vi.fn() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('renders every demo role as an option', () => {
    render(<DemoRoleSelector />);
    const select = screen.getByRole('combobox', { name: /demo role/i });
    const labels = Array.from(select.querySelectorAll('option')).map(
      (option) => option.textContent,
    );
    expect(labels).toEqual([
      'Organization Administrator',
      'Resource Manager',
      'Project Manager',
      'Executive Viewer',
      'Team Member',
    ]);
  });

  it('persists the selected role', async () => {
    const user = userEvent.setup();
    render(<DemoRoleSelector />);

    await user.selectOptions(
      screen.getByRole('combobox', { name: /demo role/i }),
      'team_member',
    );

    expect(getActiveDemoRole()).toBe('team_member');
  });
});
