import { useEffect, useState } from 'react';

import { cn } from '@/utils/cn';
import type { Employee } from '@/features/people';
import type {
  CreateFeedbackInput,
  FeedbackCategory,
  FeedbackVisibility,
} from '@/features/feedback/types';
import { FEEDBACK_CATEGORY_LABELS, FEEDBACK_VISIBILITY_LABELS } from '../utils';

interface CreateFeedbackDialogProps {
  open: boolean;
  projectId: string;
  employees: readonly Employee[];
  isPending: boolean;
  onSubmit: (input: CreateFeedbackInput) => void;
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

/** Create-feedback dialog. Controlled form; the container owns the mutation. */
export function CreateFeedbackDialog({
  open,
  projectId,
  employees,
  isPending,
  onSubmit,
  onClose,
}: CreateFeedbackDialogProps) {
  const [employeeId, setEmployeeId] = useState('');
  const [category, setCategory] = useState<FeedbackCategory>('recognition');
  const [visibility, setVisibility] =
    useState<FeedbackVisibility>('manager_only');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (open) {
      setEmployeeId(employees[0]?.id ?? '');
      setCategory('recognition');
      setVisibility('manager_only');
      setBody('');
    }
  }, [open, employees]);

  if (!open) return null;

  const canSubmit = employeeId !== '' && body.trim() !== '' && !isPending;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      projectId,
      employeeId,
      category,
      visibility,
      body: body.trim(),
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
        aria-labelledby='create-feedback-title'
        className='relative w-full max-w-lg rounded-lg border border-border bg-surface p-6 shadow-lg'
      >
        <h2
          id='create-feedback-title'
          className='text-lg font-semibold text-fg'
        >
          New feedback
        </h2>
        <form onSubmit={handleSubmit} noValidate className='mt-4 space-y-4'>
          <div>
            <label
              htmlFor='feedback-employee'
              className='text-sm font-medium text-fg-body'
            >
              Employee
            </label>
            <select
              id='feedback-employee'
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
              className={cn(inputClass, 'mt-1 h-10')}
            >
              {employees.length === 0 ? (
                <option value=''>No employees</option>
              ) : null}
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.display_name}
                </option>
              ))}
            </select>
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div>
              <label
                htmlFor='feedback-category'
                className='text-sm font-medium text-fg-body'
              >
                Category
              </label>
              <select
                id='feedback-category'
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
                htmlFor='feedback-visibility'
                className='text-sm font-medium text-fg-body'
              >
                Visibility
              </label>
              <select
                id='feedback-visibility'
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
              htmlFor='feedback-body'
              className='text-sm font-medium text-fg-body'
            >
              Feedback
            </label>
            <textarea
              id='feedback-body'
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
              {isPending ? 'Saving…' : 'Add feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
