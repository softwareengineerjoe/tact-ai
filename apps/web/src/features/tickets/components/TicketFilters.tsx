import type { Project } from '@/features/projects';
import type { TicketPriority } from '@/features/tickets/types';
import { TICKET_PRIORITY_LABELS } from '../utils';

export interface TicketFilterValues {
  search: string;
  projectId: string;
  priority: TicketPriority | '';
}

interface TicketFiltersProps {
  values: TicketFilterValues;
  projects: readonly Project[];
  onChange: (values: TicketFilterValues) => void;
  onClear: () => void;
}

const PRIORITIES: TicketPriority[] = ['critical', 'high', 'medium', 'low'];

const SELECT_CLASS =
  'h-10 rounded-md border border-border bg-surface px-3 text-sm text-fg-body focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover';

/** Presentational filter toolbar for the ticket board. Controlled. */
export function TicketFilters({
  values,
  projects,
  onChange,
  onClear,
}: TicketFiltersProps) {
  const isActive =
    values.search !== '' || values.projectId !== '' || values.priority !== '';

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <div className='flex-1 basis-56'>
        <label htmlFor='ticket-search' className='sr-only'>
          Search tickets
        </label>
        <input
          id='ticket-search'
          type='search'
          value={values.search}
          onChange={(event) =>
            onChange({ ...values, search: event.target.value })
          }
          placeholder='Search by title…'
          className='h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-fg-body focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover'
        />
      </div>

      <label htmlFor='ticket-project' className='sr-only'>
        Filter by project
      </label>
      <select
        id='ticket-project'
        value={values.projectId}
        onChange={(event) =>
          onChange({ ...values, projectId: event.target.value })
        }
        className={SELECT_CLASS}
      >
        <option value=''>All projects</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>

      <label htmlFor='ticket-priority' className='sr-only'>
        Filter by priority
      </label>
      <select
        id='ticket-priority'
        value={values.priority}
        onChange={(event) =>
          onChange({
            ...values,
            priority: event.target.value as TicketPriority | '',
          })
        }
        className={SELECT_CLASS}
      >
        <option value=''>All priorities</option>
        {PRIORITIES.map((priority) => (
          <option key={priority} value={priority}>
            {TICKET_PRIORITY_LABELS[priority]}
          </option>
        ))}
      </select>

      {isActive ? (
        <button
          type='button'
          onClick={onClear}
          className='h-10 rounded-md border border-border bg-surface px-3 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-muted'
        >
          Clear
        </button>
      ) : null}
    </div>
  );
}
