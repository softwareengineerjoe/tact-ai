import { useMemo, useState } from 'react';

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
import {
  TicketFilters,
  type TicketFilterValues,
} from '@/features/tickets/components/TicketFilters';
import { TicketSummary } from '@/features/tickets/components/TicketSummary';
import { CreateTicketForm } from '@/features/tickets/components/CreateTicketForm';
import { TicketDetailDialog } from '@/features/tickets/components/TicketDetailDialog';
import { isTicketOverdue } from '@/features/tickets/utils';
import type { CreateTicketInput, TicketStatus } from '@/features/tickets/types';

const EMPTY_FILTERS: TicketFilterValues = {
  search: '',
  projectId: '',
  priority: '',
};

/** Owns the global ticket board: data, filters, the create dialog, and the detail drawer. */
export function TicketsContainer() {
  const tickets = useTickets({ pageSize: 100 });
  const projects = useProjects({ pageSize: 100 });

  const [isCreating, setIsCreating] = useState(false);
  const [openTicketId, setOpenTicketId] = useState<string | null>(null);
  const [filters, setFilters] = useState<TicketFilterValues>(EMPTY_FILTERS);

  const detail = useTicket(openTicketId);
  const create = useCreateTicket();
  const transition = useTransitionTicket();
  const comment = useCommentTicket();

  const projectItems = useMemo(
    () => projects.data?.items ?? [],
    [projects.data?.items],
  );
  const projectNames = useMemo(
    () => Object.fromEntries(projectItems.map((p) => [p.id, p.name])),
    [projectItems],
  );

  const allTickets = useMemo(
    () => tickets.data?.items ?? [],
    [tickets.data?.items],
  );

  const summary = useMemo(() => {
    const open = allTickets.filter(
      (t) => t.status !== 'done' && t.status !== 'cancelled',
    ).length;
    return {
      total: allTickets.length,
      open,
      blocked: allTickets.filter((t) => t.status === 'blocked').length,
      overdue: allTickets.filter((t) => isTicketOverdue(t)).length,
      done: allTickets.filter((t) => t.status === 'done').length,
    };
  }, [allTickets]);

  const filteredTickets = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return allTickets.filter((ticket) => {
      if (filters.projectId !== '' && ticket.project_id !== filters.projectId) {
        return false;
      }
      if (filters.priority !== '' && ticket.priority !== filters.priority) {
        return false;
      }
      if (search !== '' && !ticket.title.toLowerCase().includes(search)) {
        return false;
      }
      return true;
    });
  }, [allTickets, filters]);

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

  const hasTickets = allTickets.length > 0;
  const hasFilteredTickets = filteredTickets.length > 0;
  const isFiltering =
    filters.search !== '' ||
    filters.projectId !== '' ||
    filters.priority !== '';

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <TicketSummary {...summary} />
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
            projects={projectItems}
            isPending={create.isPending}
            onSubmit={handleCreate}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      ) : null}

      {!hasTickets && !isCreating ? (
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

      {hasTickets ? (
        <>
          <TicketFilters
            values={filters}
            projects={projectItems}
            onChange={setFilters}
            onClear={() => setFilters(EMPTY_FILTERS)}
          />

          {hasFilteredTickets ? (
            <TicketBoard
              tickets={filteredTickets}
              onOpen={setOpenTicketId}
              projectNames={projectNames}
            />
          ) : (
            <EmptyState
              title='No matching tickets'
              description={
                isFiltering
                  ? 'Try adjusting your search or filters.'
                  : 'Nothing to show.'
              }
              action={{
                label: 'Clear filters',
                onClick: () => setFilters(EMPTY_FILTERS),
              }}
            />
          )}
        </>
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
