import { useEffect, useState } from 'react';

import { cn } from '@/utils/cn';
import type { Feedback } from '@/features/feedback/types';
import type {
  FeedbackCategory,
  FeedbackVisibility,
  UpdateFeedbackInput,
} from '@/features/feedback/types';
import { FEEDBACK_CATEGORY_LABELS, FEEDBACK_VISIBILITY_LABELS } from '../utils';

interface EditFeedbackDialogProps {
  feedback: Feedback | null;
  isPending: boolean;
  onSubmit: (input: UpdateFeedbackInput) => void;
  onClose: () => void;
}

const inputClass =
  'w-full rounded-sm border border-border bg-surface px-3 text-sm text-fg-body focus:outline-none focus:ring-2 focus:ring-primary-hover';

const CATEGORIES: FeedbackCategory[] = [
  'recognition',
  'strength',
  'improvement_area',
  'coaching',
  'project_contribution',
  'follow_up',
];

const VISIBILITIES: FeedbackVisibility[] = [
  'manager_only',
  'manager_and_employee',
  'project_leadership',
  'hr_partner',
];

/** Edit-feedback dialog. Controlled form; the container owns the mutation. */
export function EditFeedbackDialog({
  feedback,
  isPending,
  onSubmit,
  onClose,
}: EditFeedbackDialogProps) {
  const [category, setCategory] = useState<FeedbackCategory>('recognition');
  const [visibility, setVisibility] =
    useState<FeedbackVisibility>('manager_only');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (feedback) {
      setCategory(feedback.category);
      setVisibility(feedback.visibility);
      setBody(feedback.body);
    }
  }, [feedback]);

  if (!feedback) return null;

  const canSubmit = body.trim() !== '' && !isPending;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      feedbackId: feedback.id,
      projectId: feedback.project_id,
      category,
      visibility,
      body: body.trim(),
      version: feedback.version,
    });
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div
        className='absolute inset-0 bg-fg/40'
        onClick={() => !isPending && onClose()}
      />
      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby='edit-feedback-title'
        className='relative w-full max-w-lg rounded-lg border border-border bg-surface p-6 shadow-lg'
      >
        <h2 id='edit-feedback-title' className='text-lg font-semibold text-fg'>
          Edit feedback
        </h2>
        <form onSubmit={handleSubmit} noValidate className='mt-4 space-y-4'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div>
              <label
                htmlFor='edit-feedback-category'
                className='text-sm font-medium text-fg-body'
              >
                Category
              </label>
              <select
                id='edit-feedback-category'
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as FeedbackCategory)
                }
                className={cn(inputClass, 'mt-1 h-10')}
              >
                {CATEGORIES.map((value) => (
                  <option key={value} value={value}>
                    {FEEDBACK_CATEGORY_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor='edit-feedback-visibility'
                className='text-sm font-medium text-fg-body'
              >
                Visibility
              </label>
              <select
                id='edit-feedback-visibility'
                value={visibility}
                onChange={(event) =>
                  setVisibility(event.target.value as FeedbackVisibility)
                }
                className={cn(inputClass, 'mt-1 h-10')}
              >
                {VISIBILITIES.map((value) => (
                  <option key={value} value={value}>
                    {FEEDBACK_VISIBILITY_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor='edit-feedback-body'
              className='text-sm font-medium text-fg-body'
            >
              Feedback
            </label>
            <textarea
              id='edit-feedback-body'
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={4}
              maxLength={8000}
              className={cn(inputClass, 'mt-1 py-2')}
            />
          </div>

          <div className='flex items-center justify-end gap-2 pt-2'>
            <button
              type='button'
              onClick={onClose}
              disabled={isPending}
              className='h-10 rounded-md border border-border bg-surface px-4 text-sm font-medium text-fg-body transition-colors hover:bg-surface-muted disabled:opacity-50'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={!canSubmit}
              className='h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-fg transition-colors hover:bg-primary-hover disabled:opacity-50'
            >
              {isPending ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
