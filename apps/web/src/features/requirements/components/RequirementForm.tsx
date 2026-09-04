import { useState } from 'react';

import { cn } from '@/utils/cn';
import {
  RequirementFormSchema,
  type RequirementFormValues,
} from '@/features/requirements/schemas';
import { SkillChipsInput } from './SkillChipsInput';

interface RequirementFormProps {
  initialValues?: RequirementFormValues;
  submitLabel: string;
  isPending?: boolean;
  onSubmit: (values: RequirementFormValues) => void;
  onCancel?: () => void;
}

const EMPTY: RequirementFormValues = {
  roleName: '',
  headcount: 1,
  allocationPercent: 100,
  description: '',
  requiredSkills: [],
  preferredSkills: [],
};

type FieldErrors = Partial<Record<keyof RequirementFormValues, string>>;

/** Controlled form to create or edit a project role requirement. */
export function RequirementForm({
  initialValues,
  submitLabel,
  isPending = false,
  onSubmit,
  onCancel,
}: RequirementFormProps) {
  const [values, setValues] = useState<RequirementFormValues>(
    initialValues ?? EMPTY,
  );
  const [errors, setErrors] = useState<FieldErrors>({});

  const update = <K extends keyof RequirementFormValues>(
    key: K,
    value: RequirementFormValues[K],
  ) => setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const result = RequirementFormSchema.safeParse(values);
    if (!result.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof RequirementFormValues;
        nextErrors[key] ??= issue.message;
      }
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    onSubmit(result.data);
  };

  const inputClass = cn(
    'h-10 w-full rounded-md border border-border bg-surface px-3 text-sm',
    'focus:outline-none focus:ring-2 focus:ring-primary-hover focus:ring-offset-1',
  );

  return (
    <form onSubmit={handleSubmit} noValidate className='space-y-4'>
      <div>
        <label
          htmlFor='role-name'
          className='block text-sm font-medium text-fg'
        >
          Role name
        </label>
        <input
          id='role-name'
          value={values.roleName}
          onChange={(event) => update('roleName', event.target.value)}
          aria-invalid={!!errors.roleName}
          aria-describedby={errors.roleName ? 'role-name-error' : undefined}
          className={cn(inputClass, 'mt-1')}
        />
        {errors.roleName ? (
          <p
            id='role-name-error'
            role='alert'
            className='mt-1 text-xs text-danger'
          >
            {errors.roleName}
          </p>
        ) : null}
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label
            htmlFor='headcount'
            className='block text-sm font-medium text-fg'
          >
            Headcount
          </label>
          <input
            id='headcount'
            type='number'
            min={1}
            max={99}
            value={values.headcount}
            onChange={(event) =>
              update('headcount', Number(event.target.value))
            }
            aria-invalid={!!errors.headcount}
            className={cn(inputClass, 'mt-1')}
          />
          {errors.headcount ? (
            <p role='alert' className='mt-1 text-xs text-danger'>
              {errors.headcount}
            </p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor='allocation'
            className='block text-sm font-medium text-fg'
          >
            Allocation %
          </label>
          <input
            id='allocation'
            type='number'
            min={0}
            max={100}
            value={values.allocationPercent}
            onChange={(event) =>
              update('allocationPercent', Number(event.target.value))
            }
            aria-invalid={!!errors.allocationPercent}
            className={cn(inputClass, 'mt-1')}
          />
          {errors.allocationPercent ? (
            <p role='alert' className='mt-1 text-xs text-danger'>
              {errors.allocationPercent}
            </p>
          ) : null}
        </div>
      </div>

      <SkillChipsInput
        id='required-skills'
        label='Required skills'
        skills={values.requiredSkills}
        onChange={(skills) => update('requiredSkills', skills)}
      />

      <SkillChipsInput
        id='preferred-skills'
        label='Preferred skills'
        skills={values.preferredSkills}
        onChange={(skills) => update('preferredSkills', skills)}
      />

      <div>
        <label
          htmlFor='description'
          className='block text-sm font-medium text-fg'
        >
          Description <span className='text-fg-muted'>(optional)</span>
        </label>
        <textarea
          id='description'
          rows={2}
          value={values.description ?? ''}
          onChange={(event) => update('description', event.target.value)}
          className={cn(
            'mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-primary-hover focus:ring-offset-1',
          )}
        />
      </div>

      <div className='flex items-center gap-2'>
        <button
          type='submit'
          disabled={isPending}
          className='h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-fg hover:bg-primary-hover disabled:opacity-60'
        >
          {isPending ? 'Saving…' : submitLabel}
        </button>
        {onCancel ? (
          <button
            type='button'
            onClick={onCancel}
            disabled={isPending}
            className='h-10 rounded-md border border-border px-4 text-sm font-medium text-fg hover:bg-surface-muted'
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
