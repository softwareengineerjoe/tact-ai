import { useState } from 'react';

import { cn } from '@/utils/cn';
import type {
  FeedbackCategory,
  FeedbackVisibility,
} from '@/features/feedback/types';
import { FEEDBACK_CATEGORY_LABELS, FEEDBACK_VISIBILITY_LABELS } from '../utils';

export interface FeedbackEmployeeOption {
  id: string;
  display_name: string;
}

export interface FeedbackFormValues {
  employeeId: string;
  category: FeedbackCategory;
  visibility: FeedbackVisibility;
  body: string;
}

interface FeedbackFormProps {
  /** When provided, the employee picker is shown (create mode). */
  employees?: readonly FeedbackEmployeeOption[];
  initialValues?: Partial<FeedbackFormValues>;
  submitLabel: string;
  isPending?: boolean;
  onSubmit: (values: FeedbackFormValues) => void;
  onCancel: () => void;
}

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

/** Inline feedback form (create or edit). Matches the project-setup pattern (no modal). */
export function FeedbackForm({
  employees,
  initialValues,
  submitLabel,
  isPending = false,
  onSubmit,
  onCancel,
}: FeedbackFormProps) {
  const [employeeId, setEmployeeId] = useState(
    initialValues?.employeeId ?? employees?.[0]?.id ?? '',
  );
  const [category, setCategory] = useState<FeedbackCategory>(
    initialValues?.category ?? 'recognition',
  );
  const [visibility, setVisibility] = useState<FeedbackVisibility>(
    initialValues?.visibility ?? 'manager_only',
  );
  const [body, setBody] = useState(initialValues?.body ?? '');
  const [bodyError, setBodyError] = useState<string | null>(null);

  const showEmployeePicker = employees !== undefined;
  const canSubmit =
    (!showEmployeePicker || employeeId !== '') &&
    body.trim() !== '' &&
    !isPending;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (body.trim() === '') {
      setBodyError('Feedback is required');
      return;
    }
    if (!canSubmit) return;
    setBodyError(null);
    onSubmit({ employeeId, category, visibility, body: body.trim() });
  };

  const inputClass = cn(
    'h-10 w-full rounded-md border border-border bg-surface px-3 text-sm',
    'focus:outline-none focus:ring-2 focus:ring-primary-hover focus:ring-offset-1',
  );

  return (
    <form onSubmit={handleSubmit} noValidate className='space-y-4'>
      {showEmployeePicker ? (
        <div>
          <label
            htmlFor='feedback-employee'
            className='block text-sm font-medium text-fg'
          >
            Employee
          </label>
          <select
            id='feedback-employee'
            value={employeeId}
            onChange={(event) => setEmployeeId(event.target.value)}
            className={cn(inputClass, 'mt-1')}
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
      ) : null}

      <div className='grid gap-4 sm:grid-cols-2'>
        <div>
          <label
            htmlFor='feedback-category'
            className='block text-sm font-medium text-fg'
          >
            Category
          </label>
          <select
            id='feedback-category'
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as FeedbackCategory)
            }
            className={cn(inputClass, 'mt-1')}
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
            className='block text-sm font-medium text-fg'
          >
            Visibility
          </label>
          <select
            id='feedback-visibility'
            value={visibility}
            onChange={(event) =>
              setVisibility(event.target.value as FeedbackVisibility)
            }
            className={cn(inputClass, 'mt-1')}
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
          className='block text-sm font-medium text-fg'
        >
          Feedback
        </label>
        <textarea
          id='feedback-body'
          value={body}
          onChange={(event) => setBody(event.target.value)}
          aria-invalid={!!bodyError}
          aria-describedby={bodyError ? 'feedback-body-error' : undefined}
          rows={4}
          maxLength={8000}
          className={cn(
            'mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-primary-hover focus:ring-offset-1',
          )}
        />
        {bodyError ? (
          <p
            id='feedback-body-error'
            role='alert'
            className='mt-1 text-xs text-danger'
          >
            {bodyError}
          </p>
        ) : null}
      </div>

      <div className='flex items-center gap-2'>
        <button
          type='submit'
          disabled={!canSubmit}
          className='h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-fg hover:bg-primary-hover disabled:opacity-60'
        >
          {isPending ? 'Saving…' : submitLabel}
        </button>
        <button
          type='button'
          onClick={onCancel}
          disabled={isPending}
          className='h-10 rounded-md border border-border px-4 text-sm font-medium text-fg hover:bg-surface-muted disabled:opacity-50'
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
