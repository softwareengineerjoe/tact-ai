import { Link } from 'react-router-dom';

import { PermissionGate } from '@/components/shared';
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
        'flex flex-col rounded-lg border border-border bg-surface shadow-xs transition-shadow hover:shadow-sm',
        className,
      )}
    >
      <div className='flex flex-1 flex-col p-5'>
        <div className='flex items-start justify-between gap-3'>
          <h3 className='text-base font-semibold text-fg'>{project.name}</h3>
          <ProjectStatusBadge status={project.status} />
        </div>
        {project.description ? (
          <p className='mt-2 line-clamp-2 text-sm text-fg-muted'>
            {project.description}
          </p>
        ) : null}
        <p className='mt-4 text-xs font-medium uppercase tracking-wide text-fg-muted'>
          Priority: {project.priority}
        </p>
      </div>

      <div className='flex items-center justify-between gap-2 border-t border-border px-5 py-3'>
        <div className='flex items-center gap-1'>
          <PermissionGate permission='projects.edit'>
            <Link
              to={`/projects/${project.id}/setup`}
              className='rounded-md px-2.5 py-1.5 text-xs font-medium text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg'
            >
              Edit
            </Link>
          </PermissionGate>
          <PermissionGate permission='feedback.view_shared'>
            <Link
              to={`/projects/${project.id}/feedback`}
              className='rounded-md px-2.5 py-1.5 text-xs font-medium text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg'
            >
              Feedback
            </Link>
          </PermissionGate>
        </div>
        <PermissionGate permission='team.recommend'>
          <Link
            to={`/projects/${project.id}/team-builder`}
            className='inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-fg transition-colors hover:bg-primary-hover'
          >
            Team Builder
            <span aria-hidden>→</span>
          </Link>
        </PermissionGate>
      </div>
    </article>
  );
}
