import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SessionContext, type Session } from '@/app/auth/useSession';
import { CloseProjectButton } from '@/features/projects/components/CloseProjectButton';
import type { ProjectStatus } from '@/features/projects/types';
import { projectsService } from '@/services/projectsService';

const PROJECT_ID = '33333333-3333-3333-3333-333333333333';

function renderButton(permissions: string[], status: ProjectStatus = 'active') {
  const session: Session = {
    userId: 'u1',
    organizationId: 'o1',
    roles: ['project_manager'],
    permissions: permissions as Session['permissions'],
  };
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <SessionContext.Provider value={session}>
        <CloseProjectButton projectId={PROJECT_ID} status={status} />
      </SessionContext.Provider>
    </QueryClientProvider>,
  );
}

describe('CloseProjectButton', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('hides the action when the caller lacks projects.close', () => {
    renderButton(['projects.view']);
    expect(
      screen.queryByRole('button', { name: 'Close project' }),
    ).not.toBeInTheDocument();
  });

  it('does not render for already-completed projects', () => {
    renderButton(['projects.close'], 'completed');
    expect(
      screen.queryByRole('button', { name: 'Close project' }),
    ).not.toBeInTheDocument();
  });

  it('confirms then closes the project and reports released allocations', async () => {
    const user = userEvent.setup();
    const closeSpy = vi.spyOn(projectsService, 'close').mockResolvedValue({
      project: { id: PROJECT_ID, status: 'completed' } as never,
      released_allocations: 2,
    });

    renderButton(['projects.close']);

    await user.click(screen.getByRole('button', { name: 'Close project' }));
    const dialog = screen.getByRole('dialog');
    await user.click(
      within(dialog).getByRole('button', { name: 'Close project' }),
    );

    expect(closeSpy).toHaveBeenCalledWith(PROJECT_ID);
  });
});
