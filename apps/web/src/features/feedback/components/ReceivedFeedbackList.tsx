import { FeedbackVisibilityBadge } from './FeedbackVisibilityBadge';
import { FEEDBACK_CATEGORY_LABELS, FEEDBACK_STATUS_LABELS } from '../utils';
import type { Feedback } from '@/features/feedback/types';

interface ReceivedFeedbackListProps {
  items: readonly Feedback[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Read-only list of feedback an employee received, newest first. Used on the
 * People profile and in the Team Builder — it never exposes edit/delete actions
 * and only shows entries the caller is authorized to see (privacy is enforced
 * by the backend, MASTER FR-011).
 */
export function ReceivedFeedbackList({ items }: ReceivedFeedbackListProps) {
  return (
    <ul className='space-y-3'>
      {items.map((feedback) => (
        <li key={feedback.id}>
          <article className='rounded-lg border border-border bg-surface p-3 shadow-xs'>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <span className='text-xs font-medium text-fg-muted'>
                {FEEDBACK_CATEGORY_LABELS[feedback.category]}
              </span>
              <FeedbackVisibilityBadge visibility={feedback.visibility} />
            </div>
            <p className='mt-2 whitespace-pre-wrap text-sm text-fg-body'>
              {feedback.body}
            </p>
            <p className='mt-2 text-xs text-fg-muted'>
              {FEEDBACK_STATUS_LABELS[feedback.status]} ·{' '}
              {formatDate(feedback.created_at)}
            </p>
          </article>
        </li>
      ))}
    </ul>
  );
}
