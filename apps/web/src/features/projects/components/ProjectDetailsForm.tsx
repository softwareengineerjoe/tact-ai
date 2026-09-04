import { useState } from 'react';

import { cn } from '@/utils/cn';
import { ProjectPrioritySchema } from '@/features/projects/schemas';
import type {
  Project,
  ProjectPriority,
  UpdateProjectDetailsInput,
} from '@/features/projects/types';

interface ProjectDetailsFormProps {
  project: Project;
  isPending?: boolean;
  onSubmit: (input: UpdateProjectDetailsInput) => void;
}

const PRIORITIES = ProjectPrioritySchema.options;

/** Edit the core project details (name, description, objective, priority). */
export function ProjectDetailsForm({
  project,
  isPending = false,
  onSubmit,
}: ProjectDetailsFormProps) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? '');
  const [businessObjective, setBusinessObjective] = useState(
    project.business_objective ?? '',
  );
  const [priority, setPriority] = useState<ProjectPriority>(project.priority);
  const [error, setError] = useState<string | null>(null);

  const initialName = project.name;
  const initialDescription = project.description ?? '';
  const initialObjective = project.business_objective ?? '';
  const isDirty =
    name !== initialName ||
    description !== initialDescription ||
    businessObjective !== initialObjective ||
    priority !== project.priority;

  const inputClass = cn(
    'w-full rounded-md border border-border bg-surface px-3 text-sm',
    'focus:outline-none focus:ring-2 focus:ring-primary-hover focus:ring-offset-1',
  );

  const handleReset = () => {
    setName(initialName);
    setDescription(initialDescription);
    setBusinessObjective(initialObjective);
    setPriority(project.priority);
    setError(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (name.trim().length === 0) {
      setError('Project name is required.');
      return;
    }
    setError(null);
    onSubmit({
      name: name.trim(),
      description: description.trim() || null,
      businessObjective: businessObjective.trim() || null,
      priority,
      version: project.version,
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className='space-y-4'>
      <div>
        <label
          htmlFor='detail-name'
          className='block text-sm font-medium text-fg'
        >
          Project name
        </label>
        <input
          id='detail-name'
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-invalid={!!error}
          className={cn(inputClass, 'mt-1 h-10')}
        />
      </div>

      <div>
        <label
          htmlFor='detail-description'
          className='block text-sm font-medium text-fg'
        >
          Description <span className='text-fg-muted'>(optional)</span>
        </label>
        <textarea
          id='detail-description'
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className={cn(inputClass, 'mt-1 py-2')}
        />
      </div>

      <div>
        <label
          htmlFor='detail-objective'
          className='block text-sm font-medium text-fg'
        >
          Business objective <span className='text-fg-muted'>(optional)</span>
        </label>
        <textarea
          id='detail-objective'
          rows={2}
          value={businessObjective}
          onChange={(event) => setBusinessObjective(event.target.value)}
          className={cn(inputClass, 'mt-1 py-2')}
        />
      </div>

      <div className='sm:max-w-xs'>
        <label
          htmlFor='detail-priority'
          className='block text-sm font-medium text-fg'
        >
          Priority
        </label>
        <select
          id='detail-priority'
          value={priority}
          onChange={(event) =>
            setPriority(event.target.value as ProjectPriority)
          }
          className={cn(inputClass, 'mt-1 h-10 capitalize')}
        >
          {PRIORITIES.map((value) => (
            <option key={value} value={value} className='capitalize'>
              {value}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <p role='alert' className='text-xs text-danger'>
          {error}
        </p>
      ) : null}

      <div className='flex items-center justify-end gap-2 border-t border-border pt-4'>
        <button
          type='button'
          onClick={handleReset}
          disabled={isPending || !isDirty}
          className='h-10 rounded-md border border-border px-4 text-sm font-medium text-fg hover:bg-surface-muted disabled:opacity-50'
        >
          Reset
        </button>
        <button
          type='submit'
          disabled={isPending || !isDirty}
          className='h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-fg hover:bg-primary-hover disabled:opacity-60'
        >
          {isPending ? 'Saving…' : 'Save details'}
        </button>
      </div>
    </form>
  );
}
