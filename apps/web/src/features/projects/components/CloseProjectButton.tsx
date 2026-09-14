import { useState } from 'react';

import { ConfirmDialog, PermissionGate, toast } from '@/components/shared';
import { useCloseProject } from '../api/useCloseProject';
import type { ProjectStatus } from '../types';

interface CloseProjectButtonProps {
  projectId: string;
  status: ProjectStatus;
}

// Projects that are already finished cannot be closed again.
const CLOSED_STATUSES: readonly ProjectStatus[] = ['completed', 'archived'];

/**
 * Gated "Close project" action (MASTER FR-002). Confirms first because closing
 * ends every active allocation, then reports how many were released.
 */
export function CloseProjectButton({
  projectId,
  status,
}: CloseProjectButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const close = useCloseProject(projectId);

  if (CLOSED_STATUSES.includes(status)) return null;

  const handleConfirm = () => {
    close.mutate(undefined, {
      onSuccess: (result) => {
        setIsOpen(false);
        const count = result.released_allocations;
        toast.success(
          count === 1
            ? 'Project closed. 1 allocation released.'
            : `Project closed. ${count} allocations released.`,
        );
      },
      onError: (error) => toast.error(error.message),
    });
  };

  return (
    <PermissionGate permission='projects.close'>
      <button
        type='button'
        onClick={() => setIsOpen(true)}
        className='rounded-md border border-border px-3 py-1.5 text-sm font-medium text-fg-body transition-colors hover:bg-surface-muted'
      >
        Close project
      </button>
      <ConfirmDialog
        open={isOpen}
        title='Close this project?'
        description='This marks the project completed and releases every active team allocation. Assignment history is preserved.'
        confirmLabel='Close project'
        isPending={close.isPending}
        onConfirm={handleConfirm}
        onCancel={() => setIsOpen(false)}
      />
    </PermissionGate>
  );
}
