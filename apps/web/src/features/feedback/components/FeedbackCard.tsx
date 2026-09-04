import { PermissionGate } from '@/components/shared';
import type { Feedback } from '@/features/feedback/types';
import { FEEDBACK_CATEGORY_LABELS, FEEDBACK_STATUS_LABELS } from '../utils';
import { FeedbackVisibilityBadge } from './FeedbackVisibilityBadge';

interface FeedbackCardProps {
  feedback: Feedback;
  isAcknowledging: boolean;
  onAcknowledge: (feedback: Feedback) => void;
  onEdit: (feedback: Feedback) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Presentational feedback entry with category, visibility, and acknowledge. */
export function FeedbackCard({
  feedback,
  isAcknowledging,
  onAcknowledge,
  onEdit,
}: FeedbackCardProps) {
  const canAcknowledge =
    feedback.visibility !== 'manager_only' &&
    feedback.status !== 'acknowledged' &&
    feedback.status !== 'closed';

  return (
    <article className='rounded-lg border border-border bg-surface p-4 shadow-xs'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <h3 className='text-sm font-semibold text-fg'>
            {feedback.employee_name ?? 'Employee'}
          </h3>
          <span className='text-xs font-medium text-fg-muted'>
            {FEEDBACK_CATEGORY_LABELS[feedback.category]}
          </span>
        </div>
        <FeedbackVisibilityBadge visibility={feedback.visibility} />
      </div>

      <p className='mt-2 whitespace-pre-wrap text-sm text-fg-body'>
        {feedback.body}
      </p>

      <div className='mt-3 flex flex-wrap items-center justify-between gap-2'>
        <p className='text-xs text-fg-muted'>
          {FEEDBACK_STATUS_LABELS[feedback.status]} ·{' '}
          {formatDate(feedback.created_at)}
        </p>
        <div className='flex items-center gap-2'>
          <PermissionGate permission='feedback.edit'>
            <button
              type='button'
              onClick={() => onEdit(feedback)}
              className='h-8 rounded-md border border-border bg-surface px-3 text-xs font-medium text-fg-body transition-colors hover:bg-surface-muted'
            >
              Edit
            </button>
          </PermissionGate>
          {canAcknowledge ? (
            <PermissionGate permission='feedback.acknowledge'>
              <button
                type='button'
                onClick={() => onAcknowledge(feedback)}
                disabled={isAcknowledging}
                className='h-8 rounded-md border border-border bg-surface px-3 text-xs font-medium text-fg-body transition-colors hover:bg-surface-muted disabled:opacity-50'
              >
                Acknowledge
              </button>
            </PermissionGate>
          ) : null}
        </div>
      </div>
    </article>
  );
}
