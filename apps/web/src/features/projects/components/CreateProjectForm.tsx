import { useState } from 'react';

import { cn } from '@/utils/cn';
import { ConfirmDialog } from '@/components/shared';
import {
  CreateProjectSchema,
  ProjectPrioritySchema,
} from '@/features/projects/schemas';
import type {
  CreateProjectInput,
  ProjectPriority,
} from '@/features/projects/types';

interface CreateProjectFormProps {
  isPending?: boolean;
  onSubmit: (values: CreateProjectInput) => void;
  onCancel?: () => void;
}

interface FormState {
  name: string;
  description: string;
  business_objective: string;
  priority: ProjectPriority;
}

const PRIORITIES = ProjectPrioritySchema.options;

const EMPTY: FormState = {
  name: '',
  description: '',
  business_objective: '',
  priority: 'medium',
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

/** Controlled form to create a new project (MASTER §25 Create Project). */
export function CreateProjectForm({
  isPending = false,
  onSubmit,
  onCancel,
}: CreateProjectFormProps) {
  const [values, setValues] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [confirmCancel, setConfirmCancel] = useState(false);

  const isDirty =
    values.name !== EMPTY.name ||
    values.description !== EMPTY.description ||
    values.business_objective !== EMPTY.business_objective ||
    values.priority !== EMPTY.priority;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const result = CreateProjectSchema.safeParse({
      name: values.name,
      description: values.description || undefined,
      business_objective: values.business_objective || undefined,
      priority: values.priority,
    });
    if (!result.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FormState;
        nextErrors[key] ??= issue.message;
      }
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    onSubmit(result.data);
  };

  const inputClass = cn(
    'w-full rounded-md border border-border bg-surface px-3 text-sm',
    'focus:outline-none focus:ring-2 focus:ring-primary-hover focus:ring-offset-1',
  );

  const handleCancel = () => {
    if (!onCancel) return;
    if (isDirty) {
      setConfirmCancel(true);
      return;
    }
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className='max-w-xl space-y-4'>
      <div>
        <label htmlFor='name' className='block text-sm font-medium text-fg'>
          Project name
        </label>
        <input
          id='name'
          value={values.name}
          onChange={(event) => update('name', event.target.value)}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
          className={cn(inputClass, 'mt-1 h-10')}
        />
        {errors.name ? (
          <p id='name-error' role='alert' className='mt-1 text-xs text-danger'>
            {errors.name}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor='description'
          className='block text-sm font-medium text-fg'
        >
          Description <span className='text-fg-muted'>(optional)</span>
        </label>
        <textarea
          id='description'
          rows={3}
          value={values.description}
          onChange={(event) => update('description', event.target.value)}
          className={cn(inputClass, 'mt-1 py-2')}
        />
      </div>

      <div>
        <label
          htmlFor='business-objective'
          className='block text-sm font-medium text-fg'
        >
          Business objective <span className='text-fg-muted'>(optional)</span>
        </label>
        <textarea
          id='business-objective'
          rows={2}
          value={values.business_objective}
          onChange={(event) =>
            update('business_objective', event.target.value)
          }
          className={cn(inputClass, 'mt-1 py-2')}
        />
      </div>

      <div className='sm:max-w-xs'>
        <label htmlFor='priority' className='block text-sm font-medium text-fg'>
          Priority
        </label>
        <select
          id='priority'
          value={values.priority}
          onChange={(event) =>
            update('priority', event.target.value as ProjectPriority)
          }
          className={cn(inputClass, 'mt-1 h-10 capitalize')}
        >
          {PRIORITIES.map((priority) => (
            <option key={priority} value={priority} className='capitalize'>
              {priority}
            </option>
          ))}
        </select>
      </div>

      <div className='flex items-center justify-end gap-2 border-t border-border pt-4'>
        {onCancel ? (
          <button
            type='button'
            onClick={handleCancel}
            disabled={isPending}
            className='h-10 rounded-md border border-border px-4 text-sm font-medium text-fg hover:bg-surface-muted disabled:opacity-60'
          >
            Cancel
          </button>
        ) : null}
        <button
          type='submit'
          disabled={isPending}
          className='h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-fg hover:bg-primary-hover disabled:opacity-60'
        >
          {isPending ? 'Creating…' : 'Create project'}
        </button>
      </div>

      {onCancel ? (
        <ConfirmDialog
          open={confirmCancel}
          title='Discard this project?'
          description='Your entered details will be lost and no project will be created.'
          confirmLabel='Discard'
          cancelLabel='Keep editing'
          tone='danger'
          onConfirm={() => {
            setConfirmCancel(false);
            onCancel();
          }}
          onCancel={() => setConfirmCancel(false)}
        />
      ) : null}
    </form>
  );
}
