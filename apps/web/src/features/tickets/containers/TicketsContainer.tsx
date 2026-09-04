import { useState } from 'react';

import {
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingState,
  PermissionGate,
  toast,
} from '@/components/shared';
import { useProjects } from '@/features/projects';
import { useTickets } from '@/features/tickets/api/useTickets';
import { useTicket } from '@/features/tickets/api/useTicket';
import { useCreateTicket } from '@/features/tickets/api/useCreateTicket';
import { useTransitionTicket } from '@/features/tickets/api/useTransitionTicket';
import { useCommentTicket } from '@/features/tickets/api/useCommentTicket';
import { TicketBoard } from '@/features/tickets/components/TicketBoard';
import { CreateTicketForm } from '@/features/tickets/components/CreateTicketForm';
import { TicketDetailDialog } from '@/features/tickets/components/TicketDetailDialog';
import type { CreateTicketInput, TicketStatus } from '@/features/tickets/types';

/** Owns the global ticket board: data, the create dialog, and the detail drawer. */
export function TicketsContainer() {
  const tickets = useTickets({ pageSize: 100 });
  const projects = useProjects({ pageSize: 100 });

  const [isCreating, setIsCreating] = useState(false);
  const [openTicketId, setOpenTicketId] = useState<string | null>(null);

  const detail = useTicket(openTicketId);
  const create = useCreateTicket();
  const transition = useTransitionTicket();
  const comment = useCommentTicket();

  const handleCreate = (input: Omit<CreateTicketInput, 'assigneeId'>) => {
    create.mutate(
      { ...input, assigneeId: null },
      {
        onSuccess: () => {
          toast.success('Ticket created');
          setIsCreating(false);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const handleTransition = (status: TicketStatus, blockerReason?: string) => {
    if (!detail.data) return;
    transition.mutate(
      {
        ticketId: detail.data.id,
        status,
        blockerReason,
        version: detail.data.version,
      },
      {
        onSuccess: () => toast.success('Ticket updated'),
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const handleComment = (body: string) => {
    if (!detail.data) return;
    comment.mutate(
      { ticketId: detail.data.id, body },
      {
        onSuccess: () => toast.success('Comment added'),
        onError: (error) => toast.error(error.message),
      },
    );
  };

  if (tickets.isPending) {
    return <LoadingState label='Loading tickets' variant='skeleton' rows={4} />;
  }
  if (tickets.isError && tickets.error.status === 403) {
    return <ForbiddenState requiredPermissions={['tickets.view']} />;
  }
  if (tickets.isError) {
    return (
      <ErrorState
        error={tickets.error}
        onRetry={() => void tickets.refetch()}
      />
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between gap-2'>
        <p className='text-sm text-fg-muted'>
          {tickets.data.total} ticket{tickets.data.total === 1 ? '' : 's'}{' '}
          across your projects
        </p>
        <PermissionGate permission='tickets.create'>
          {!isCreating ? (
            <button
              type='button'
              onClick={() => setIsCreating(true)}
              className='h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-fg transition-colors hover:bg-primary-hover'
            >
              New ticket
            </button>
          ) : null}
        </PermissionGate>
      </div>

      {isCreating ? (
        <div className='rounded-lg border border-border bg-surface p-4 shadow-xs'>
          <h2 className='mb-3 font-medium text-fg'>New ticket</h2>
          <CreateTicketForm
            projects={projects.data?.items ?? []}
            isPending={create.isPending}
            onSubmit={handleCreate}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      ) : null}

      {tickets.data.items.length === 0 && !isCreating ? (
        <EmptyState
          title='No tickets yet'
          description='Create your first ticket to start tracking work.'
          action={{
            label: 'New ticket',
            onClick: () => setIsCreating(true),
            permission: 'tickets.create',
          }}
        />
      ) : null}

      {tickets.data.items.length > 0 ? (
        <TicketBoard tickets={tickets.data.items} onOpen={setOpenTicketId} />
      ) : null}

      {openTicketId !== null && detail.data ? (
        <TicketDetailDialog
          ticket={detail.data}
          isTransitioning={transition.isPending}
          isCommenting={comment.isPending}
          onTransition={handleTransition}
          onComment={handleComment}
          onClose={() => setOpenTicketId(null)}
        />
      ) : null}
    </div>
  );
}
