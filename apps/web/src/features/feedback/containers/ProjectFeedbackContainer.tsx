import { useState } from 'react';

import {
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingState,
  PermissionGate,
  toast,
} from '@/components/shared';
import { usePeople } from '@/features/people';
import { useTickets } from '@/features/tickets';
import { useProjectFeedback } from '@/features/feedback/api/useProjectFeedback';
import { useCreateFeedback } from '@/features/feedback/api/useCreateFeedback';
import { useAcknowledgeFeedback } from '@/features/feedback/api/useAcknowledgeFeedback';
import { ContributionSummary } from '@/features/feedback/components/ContributionSummary';
import { CreateFeedbackDialog } from '@/features/feedback/components/CreateFeedbackDialog';
import { FeedbackList } from '@/features/feedback/components/FeedbackList';
import type { CreateFeedbackInput, Feedback } from '@/features/feedback/types';

interface ProjectFeedbackContainerProps {
  projectId: string;
}

/** Owns a project's feedback list, the create dialog, and the contribution summary. */
export function ProjectFeedbackContainer({
  projectId,
}: ProjectFeedbackContainerProps) {
  const feedback = useProjectFeedback(projectId);
  const people = usePeople({ pageSize: 100 });
  const tickets = useTickets({ pageSize: 100 });

  const [isCreating, setIsCreating] = useState(false);
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);

  const create = useCreateFeedback();
  const acknowledge = useAcknowledgeFeedback();

  const handleCreate = (input: CreateFeedbackInput) => {
    create.mutate(input, {
      onSuccess: () => {
        toast.success('Feedback added');
        setIsCreating(false);
      },
      onError: (error) => toast.error(error.message),
    });
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

  return (
    <div className='space-y-6'>
      <ContributionSummary tickets={projectTickets} />

      <div className='space-y-4'>
        <div className='flex items-center justify-between gap-2'>
          <h2 className='text-sm font-semibold text-fg'>Feedback</h2>
          <PermissionGate permission='feedback.create'>
            <button
              type='button'
              onClick={() => setIsCreating(true)}
              className='h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-fg transition-colors hover:bg-primary-hover'
            >
              New feedback
            </button>
          </PermissionGate>
        </div>

        {feedback.data.length === 0 ? (
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
          <FeedbackList
            items={feedback.data}
            acknowledgingId={acknowledgingId}
            onAcknowledge={handleAcknowledge}
          />
        )}
      </div>

      <CreateFeedbackDialog
        open={isCreating}
        projectId={projectId}
        employees={people.data?.items ?? []}
        isPending={create.isPending}
        onSubmit={handleCreate}
        onClose={() => setIsCreating(false)}
      />
    </div>
  );
}
