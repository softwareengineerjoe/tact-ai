import { useState } from 'react';

import { cn } from '@/utils/cn';
import type { Project, UpdateProjectInput } from '@/features/projects';

interface ProjectScheduleFormProps {
  project: Project;
  isPending?: boolean;
  onSubmit: (input: UpdateProjectInput) => void;
}

/** Converts an ISO datetime (or null) to a `YYYY-MM-DD` value for date inputs. */
function toDateInput(value: string | null): string {
  return value ? value.slice(0, 10) : '';
}

/** Converts a `YYYY-MM-DD` value back to an ISO datetime (or null). */
function toIso(value: string): string | null {
  return value ? new Date(`${value}T00:00:00Z`).toISOString() : null;
}

/** Form for the project schedule and expected team size. */
export function ProjectScheduleForm({
  project,
  isPending = false,
  onSubmit,
}: ProjectScheduleFormProps) {
  const [startDate, setStartDate] = useState(toDateInput(project.start_date));
  const [targetEndDate, setTargetEndDate] = useState(
    toDateInput(project.target_end_date),
  );
  const [expectedTeamSize, setExpectedTeamSize] = useState(
    project.expected_team_size?.toString() ?? '',
  );
  const [error, setError] = useState<string | null>(null);

  const initialStart = toDateInput(project.start_date);
  const initialEnd = toDateInput(project.target_end_date);
  const initialTeamSize = project.expected_team_size?.toString() ?? '';
  const isDirty =
    startDate !== initialStart ||
    targetEndDate !== initialEnd ||
    expectedTeamSize !== initialTeamSize;

  const handleReset = () => {
    setStartDate(initialStart);
    setTargetEndDate(initialEnd);
    setExpectedTeamSize(initialTeamSize);
    setError(null);
  };

  const inputClass = cn(
    'h-10 w-full rounded-md border border-border bg-surface px-3 text-sm',
    'focus:outline-none focus:ring-2 focus:ring-primary-hover focus:ring-offset-1',
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (startDate && targetEndDate && targetEndDate < startDate) {
      setError('Target end date must be on or after the start date.');
      return;
    }
    setError(null);
    onSubmit({
      startDate: toIso(startDate),
      targetEndDate: toIso(targetEndDate),
      expectedTeamSize: expectedTeamSize ? Number(expectedTeamSize) : null,
      version: project.version,
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className='space-y-4'>
      <div className='grid gap-4 sm:grid-cols-2'>
        <div>
          <label
            htmlFor='start-date'
            className='block text-sm font-medium text-fg'
          >
            Start date
          </label>
          <input
            id='start-date'
            type='date'
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className={cn(inputClass, 'mt-1')}
          />
        </div>
        <div>
          <label
            htmlFor='target-end-date'
            className='block text-sm font-medium text-fg'
          >
            Target end date
          </label>
          <input
            id='target-end-date'
            type='date'
            value={targetEndDate}
            onChange={(event) => setTargetEndDate(event.target.value)}
            className={cn(inputClass, 'mt-1')}
          />
        </div>
      </div>

      <div className='sm:max-w-xs'>
        <label
          htmlFor='team-size'
          className='block text-sm font-medium text-fg'
        >
          Expected team size <span className='text-fg-muted'>(optional)</span>
        </label>
        <input
          id='team-size'
          type='number'
          min={1}
          max={999}
          value={expectedTeamSize}
          onChange={(event) => setExpectedTeamSize(event.target.value)}
          className={cn(inputClass, 'mt-1')}
        />
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
          {isPending ? 'Saving…' : 'Save schedule'}
        </button>
      </div>
    </form>
  );
}
