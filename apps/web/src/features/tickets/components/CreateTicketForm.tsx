import { useState } from 'react';

import { cn } from '@/utils/cn';
import type { Project } from '@/features/projects';
import type {
  CreateTicketInput,
  TicketPriority,
  TicketType,
} from '@/features/tickets/types';
import { TICKET_PRIORITY_LABELS, TICKET_TYPE_LABELS } from '../utils';

interface CreateTicketFormProps {
  projects: readonly Project[];
  isPending?: boolean;
  onSubmit: (input: Omit<CreateTicketInput, 'assigneeId'>) => void;
  onCancel: () => void;
}

const TYPES: TicketType[] = [
  'task',
  'user_story',
  'bug',
  'improvement',
  'epic',
  'support_issue',
];
const PRIORITIES: TicketPriority[] = ['low', 'medium', 'high', 'critical'];

/** Inline create-ticket form. Matches the project-setup pattern (no modal). */
export function CreateTicketForm({
  projects,
  isPending = false,
  onSubmit,
  onCancel,
}: CreateTicketFormProps) {
  const [projectId, setProjectId] = useState(projects[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ticketType, setTicketType] = useState<TicketType>('task');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [storyPoints, setStoryPoints] = useState('');
  const [titleError, setTitleError] = useState<string | null>(null);

  const canSubmit = projectId !== '' && title.trim() !== '' && !isPending;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (title.trim() === '') {
      setTitleError('Title is required');
      return;
    }
    if (!canSubmit) return;
    setTitleError(null);
    onSubmit({
      projectId,
      title: title.trim(),
      description: description.trim() || null,
      ticketType,
      priority,
      storyPoints: storyPoints === '' ? null : Number(storyPoints),
    });
  };

  const inputClass = cn(
    'h-10 w-full rounded-md border border-border bg-surface px-3 text-sm',
    'focus:outline-none focus:ring-2 focus:ring-primary-hover focus:ring-offset-1',
  );

  return (
    <form onSubmit={handleSubmit} noValidate className='space-y-4'>
      <div>
        <label
          htmlFor='ticket-project'
          className='block text-sm font-medium text-fg'
        >
          Project
        </label>
        <select
          id='ticket-project'
          value={projectId}
          onChange={(event) => setProjectId(event.target.value)}
          className={cn(inputClass, 'mt-1')}
        >
          {projects.length === 0 ? <option value=''>No projects</option> : null}
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor='ticket-title'
          className='block text-sm font-medium text-fg'
        >
          Title
        </label>
        <input
          id='ticket-title'
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-invalid={!!titleError}
          aria-describedby={titleError ? 'ticket-title-error' : undefined}
          maxLength={240}
          className={cn(inputClass, 'mt-1')}
        />
        {titleError ? (
          <p
            id='ticket-title-error'
            role='alert'
            className='mt-1 text-xs text-danger'
          >
            {titleError}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor='ticket-desc'
          className='block text-sm font-medium text-fg'
        >
          Description <span className='text-fg-muted'>(optional)</span>
        </label>
        <textarea
          id='ticket-desc'
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          className={cn(
            'mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-primary-hover focus:ring-offset-1',
          )}
        />
      </div>

      <div className='grid gap-4 sm:grid-cols-3'>
        <div>
          <label
            htmlFor='ticket-type'
            className='block text-sm font-medium text-fg'
          >
            Type
          </label>
          <select
            id='ticket-type'
            value={ticketType}
            onChange={(event) =>
              setTicketType(event.target.value as TicketType)
            }
            className={cn(inputClass, 'mt-1')}
          >
            {TYPES.map((type) => (
              <option key={type} value={type}>
                {TICKET_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor='ticket-priority'
            className='block text-sm font-medium text-fg'
          >
            Priority
          </label>
          <select
            id='ticket-priority'
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value as TicketPriority)
            }
            className={cn(inputClass, 'mt-1')}
          >
            {PRIORITIES.map((value) => (
              <option key={value} value={value}>
                {TICKET_PRIORITY_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor='ticket-points'
            className='block text-sm font-medium text-fg'
          >
            Story points
          </label>
          <input
            id='ticket-points'
            type='number'
            min={0}
            max={100}
            value={storyPoints}
            onChange={(event) => setStoryPoints(event.target.value)}
            className={cn(inputClass, 'mt-1')}
          />
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <button
          type='submit'
          disabled={!canSubmit}
          className='h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-fg hover:bg-primary-hover disabled:opacity-60'
        >
          {isPending ? 'Saving…' : 'Create ticket'}
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
