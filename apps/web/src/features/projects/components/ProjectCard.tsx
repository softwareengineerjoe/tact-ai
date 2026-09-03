import { cn } from '@/utils/cn';
import type { Project } from '@/features/projects/types';
import { ProjectStatusBadge } from './ProjectStatusBadge';

interface ProjectCardProps {
  project: Project;
  className?: string;
}

/** Presentational card for a single project. Pure: no data fetching. */
export function ProjectCard({ project, className }: ProjectCardProps) {
  return (
    <article
      className={cn(
        'rounded-lg border border-border bg-surface p-4 shadow-xs',
        className,
      )}
    >
      <div className='flex items-start justify-between gap-3'>
        <h3 className='font-medium text-fg'>{project.name}</h3>
        <ProjectStatusBadge status={project.status} />
      </div>
      {project.description ? (
        <p className='mt-2 line-clamp-2 text-sm text-fg-muted'>
          {project.description}
        </p>
      ) : null}
      <p className='mt-3 text-xs uppercase tracking-wide text-fg-muted'>
        Priority: {project.priority}
      </p>
    </article>
  );
}
