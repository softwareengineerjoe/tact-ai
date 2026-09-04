import { useEffect, useState } from 'react';

import { cn } from '@/utils/cn';
import type { Project } from '@/features/projects';
import type {
  CreateTicketInput,
  TicketPriority,
  TicketType,
} from '@/features/tickets/types';
import { TICKET_PRIORITY_LABELS, TICKET_TYPE_LABELS } from '../utils';

interface CreateTicketDialogProps {
  open: boolean;
  projects: readonly Project[];
  isPending: boolean;
  onSubmit: (input: Omit<CreateTicketInput, 'assigneeId'>) => void;
  onClose: () => void;
}

const inputClass =
  'w-full rounded-sm border border-border bg-surface px-3 text-sm text-fg-body focus:outline-none focus:ring-2 focus:ring-primary-hover';

const TYPES: TicketType[] = [
  'task',
  'user_story',
  'bug',
  'improvement',
  'epic',
  'support_issue',
];
const PRIORITIES: TicketPriority[] = ['low', 'medium', 'high', 'critical'];

/** Create-ticket dialog. Controlled form; the container owns the mutation. */
export function CreateTicketDialog({
  open,
  projects,
  isPending,
  onSubmit,
  onClose,
}: CreateTicketDialogProps) {
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ticketType, setTicketType] = useState<TicketType>('task');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [storyPoints, setStoryPoints] = useState('');

  useEffect(() => {
    if (open) {
      setProjectId(projects[0]?.id ?? '');
      setTitle('');
      setDescription('');
      setTicketType('task');
      setPriority('medium');
      setStoryPoints('');
    }
  }, [open, projects]);

  if (!open) return null;

  const canSubmit = projectId !== '' && title.trim() !== '' && !isPending;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      projectId,
      title: title.trim(),
      description: description.trim() || null,
      ticketType,
      priority,
      storyPoints: storyPoints === '' ? null : Number(storyPoints),
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
        aria-labelledby='create-ticket-title'
        className='relative w-full max-w-lg rounded-lg border border-border bg-surface p-6 shadow-lg'
      >
        <h2 id='create-ticket-title' className='text-lg font-semibold text-fg'>
          New ticket
        </h2>
        <form onSubmit={handleSubmit} noValidate className='mt-4 space-y-4'>
          <div>
            <label
              htmlFor='ticket-project'
              className='text-sm font-medium text-fg-body'
            >
              Project
            </label>
            <select
              id='ticket-project'
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
              className={cn(inputClass, 'mt-1 h-10')}
            >
              {projects.length === 0 ? (
                <option value=''>No projects</option>
              ) : null}
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
              className='text-sm font-medium text-fg-body'
            >
              Title
            </label>
            <input
              id='ticket-title'
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={cn(inputClass, 'mt-1 h-10')}
              maxLength={240}
            />
          </div>

          <div>
            <label
              htmlFor='ticket-desc'
              className='text-sm font-medium text-fg-body'
            >
              Description <span className='text-fg-muted'>(optional)</span>
            </label>
            <textarea
              id='ticket-desc'
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className={cn(inputClass, 'mt-1 py-2')}
            />
          </div>

          <div className='grid gap-4 sm:grid-cols-3'>
            <div>
              <label
                htmlFor='ticket-type'
                className='text-sm font-medium text-fg-body'
              >
                Type
              </label>
              <select
                id='ticket-type'
                value={ticketType}
                onChange={(event) =>
                  setTicketType(event.target.value as TicketType)
                }
                className={cn(inputClass, 'mt-1 h-10')}
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
                className='text-sm font-medium text-fg-body'
              >
                Priority
              </label>
              <select
                id='ticket-priority'
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value as TicketPriority)
                }
                className={cn(inputClass, 'mt-1 h-10')}
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
                className='text-sm font-medium text-fg-body'
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
                className={cn(inputClass, 'mt-1 h-10')}
              />
            </div>
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
              className='h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-fg transition-colors hover:bg-primary-hover disabled:opacity-60'
            >
              Create ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
