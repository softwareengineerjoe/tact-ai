import { useState } from 'react';

import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingState,
  PermissionGate,
  toast,
} from '@/components/shared';
import { useProjectTeam } from '@/features/team-builder';
import { useTickets } from '@/features/tickets';
import { useProjectFeedback } from '@/features/feedback/api/useProjectFeedback';
import { useCreateFeedback } from '@/features/feedback/api/useCreateFeedback';
import { useUpdateFeedback } from '@/features/feedback/api/useUpdateFeedback';
import { useDeleteFeedback } from '@/features/feedback/api/useDeleteFeedback';
import { useAcknowledgeFeedback } from '@/features/feedback/api/useAcknowledgeFeedback';
import { ContributionSummary } from '@/features/feedback/components/ContributionSummary';
import { FeedbackForm } from '@/features/feedback/components/FeedbackForm';
import type { FeedbackFormValues } from '@/features/feedback/components/FeedbackForm';
import { FeedbackList } from '@/features/feedback/components/FeedbackList';
import type { Feedback } from '@/features/feedback/types';

interface ProjectFeedbackContainerProps {
  projectId: string;
}

/** Owns a project's feedback list, the create dialog, and the contribution summary. */
export function ProjectFeedbackContainer({
  projectId,
}: ProjectFeedbackContainerProps) {
  const feedback = useProjectFeedback(projectId);
  const team = useProjectTeam(projectId);
  const tickets = useTickets({ pageSize: 100 });

  const [isCreating, setIsCreating] = useState(false);
  const [editing, setEditing] = useState<Feedback | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Feedback | null>(null);
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);

  const create = useCreateFeedback();
  const update = useUpdateFeedback();
  const remove = useDeleteFeedback();
  const acknowledge = useAcknowledgeFeedback();

  const handleCreate = (values: FeedbackFormValues) => {
    create.mutate(
      { ...values, projectId },
      {
        onSuccess: () => {
          toast.success('Feedback added');
          setIsCreating(false);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const handleUpdate = (values: FeedbackFormValues) => {
    if (!editing) return;
    update.mutate(
      {
        feedbackId: editing.id,
        projectId: editing.project_id,
        category: values.category,
        visibility: values.visibility,
        body: values.body,
        version: editing.version,
      },
      {
        onSuccess: () => {
          toast.success('Feedback updated');
          setEditing(null);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    remove.mutate(
      {
        feedbackId: pendingDelete.id,
        projectId,
        version: pendingDelete.version,
      },
      {
        onSuccess: () => {
          toast.success('Feedback deleted');
          setPendingDelete(null);
        },
        onError: (error) => {
          toast.error(error.message);
          setPendingDelete(null);
        },
      },
    );
  };

  const handleAcknowledge = (item: Feedback) => {
    setAcknowledgingId(item.id);
    acknowledge.mutate(
      { feedbackId: item.id, projectId },
      {
        onSuccess: () => toast.success('Feedback acknowledged'),
        onError: (error) => toast.error(error.message),
        onSettled: () => setAcknowledgingId(null),
      },
    );
  };

  if (feedback.isPending) {
    return (
      <LoadingState label='Loading feedback' variant='skeleton' rows={3} />
    );
  }
  if (feedback.isError && feedback.error.status === 403) {
    return <ForbiddenState requiredPermissions={['feedback.view_shared']} />;
  }
  if (feedback.isError) {
    return (
      <ErrorState
        error={feedback.error}
        onRetry={() => void feedback.refetch()}
      />
    );
  }

  const projectTickets = (tickets.data?.items ?? []).filter(
    (ticket) => ticket.project_id === projectId,
  );

  // Feedback correlates to project participation: only employees who worked or
  // are working on this project (confirmed/active/ended assignments) (FR-011).
  const QUALIFYING_STATUSES = new Set(['confirmed', 'active', 'ended']);
  const teamEmployees = Array.from(
    new Map(
      (team.data ?? [])
        .filter((a) => QUALIFYING_STATUSES.has(a.status))
        .map((a) => [
          a.employee_id,
          {
            id: a.employee_id,
            display_name: a.employee_display_name ?? 'Employee',
          },
        ]),
    ).values(),
  );
  const hasTeam = teamEmployees.length > 0;

  return (
    <div className='space-y-6'>
      <ContributionSummary tickets={projectTickets} />

      <div className='space-y-4'>
        <div className='flex items-center justify-between gap-2'>
          <h2 className='text-sm font-semibold text-fg'>Feedback</h2>
          <PermissionGate permission='feedback.create'>
            {!isCreating && !editing && hasTeam ? (
              <button
                type='button'
                onClick={() => setIsCreating(true)}
                className='h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-fg transition-colors hover:bg-primary-hover'
              >
                New feedback
              </button>
            ) : null}
          </PermissionGate>
        </div>

        {isCreating ? (
          <div className='rounded-lg border border-border bg-surface p-4 shadow-xs'>
            <h3 className='mb-3 font-medium text-fg'>New feedback</h3>
            <FeedbackForm
              employees={teamEmployees}
              submitLabel='Add feedback'
              isPending={create.isPending}
              onSubmit={handleCreate}
              onCancel={() => setIsCreating(false)}
            />
          </div>
        ) : null}

        {editing ? (
          <div className='rounded-lg border border-border bg-surface p-4 shadow-xs'>
            <h3 className='mb-3 font-medium text-fg'>Edit feedback</h3>
            <FeedbackForm
              initialValues={{
                employeeId: editing.employee_id,
                category: editing.category,
                visibility: editing.visibility,
                body: editing.body,
              }}
              submitLabel='Save changes'
              isPending={update.isPending}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(null)}
            />
          </div>
        ) : null}

        {feedback.data.length === 0 && !isCreating ? (
          hasTeam ? (
            <EmptyState
              title='No feedback yet'
              description='Record project-related feedback for a team member.'
              action={{
                label: 'New feedback',
                onClick: () => setIsCreating(true),
                permission: 'feedback.create',
              }}
            />
          ) : (
            <EmptyState
              title='No team members yet'
              description='Feedback can only be recorded for employees assigned to this project. Confirm a team member in the Team Builder first.'
            />
          )
        ) : null}

        {feedback.data.length > 0 ? (
          <FeedbackList
            items={feedback.data}
            acknowledgingId={acknowledgingId}
            onAcknowledge={handleAcknowledge}
            onEdit={setEditing}
            onDelete={setPendingDelete}
          />
        ) : null}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title='Delete this feedback?'
        description='The feedback will be removed from the project. Its revision history is preserved.'
        confirmLabel='Delete'
        tone='danger'
        isPending={remove.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
