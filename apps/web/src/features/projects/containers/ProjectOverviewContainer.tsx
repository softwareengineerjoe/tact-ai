import { Link } from 'react-router-dom';

import {
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingState,
  PermissionGate,
} from '@/components/shared';
import { useProject } from '../api/useProject';
import { useProjectOverview } from '../api/useProjectOverview';
import { CloseProjectButton } from '../components/CloseProjectButton';
import { ProjectOverviewCard } from '../components/ProjectOverviewCard';
import { ProjectStatusBadge } from '../components/ProjectStatusBadge';

interface ProjectOverviewContainerProps {
  projectId: string;
}

/**
 * Owns the project overview lifecycle: loads the project header and its
 * progress + health snapshot with the standard states (MASTER FR-013, FR-014).
 */
export function ProjectOverviewContainer({
  projectId,
}: ProjectOverviewContainerProps) {
  const project = useProject(projectId);
  const overview = useProjectOverview(projectId);

  if (project.isPending || overview.isPending) {
    return (
      <LoadingState
        label='Loading the project overview'
        variant='skeleton'
        rows={5}
      />
    );
  }
  if (overview.isError && overview.error.status === 403) {
    return <ForbiddenState requiredPermissions={['projects.view']} />;
  }
  if (project.isError) {
    return <ErrorState error={project.error} onRetry={project.refetch} />;
  }
  if (overview.isError) {
    return <ErrorState error={overview.error} onRetry={overview.refetch} />;
  }
  if (
    overview.data.tickets.total === 0 &&
    overview.data.staffing.required_headcount === 0
  ) {
    return (
      <EmptyState
        title='Nothing to show yet'
        description='Define role requirements and create tickets to track progress and health.'
        action={{
          label: 'Open Team Builder',
          onClick: () => {
            window.location.href = `/projects/${projectId}/team-builder`;
          },
          permission: 'team.recommend',
        }}
      />
    );
  }

  return (
    <div className='space-y-5'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <h2 className='text-lg font-semibold text-fg'>{project.data.name}</h2>
          <ProjectStatusBadge status={project.data.status} />
        </div>
        <div className='flex items-center gap-2'>
          <PermissionGate permission='team.recommend'>
            <Link
              to={`/projects/${projectId}/team-builder`}
              className='rounded-md border border-border px-3 py-1.5 text-sm font-medium text-fg-body transition-colors hover:bg-surface-muted'
            >
              Team Builder
            </Link>
          </PermissionGate>
          <PermissionGate permission='reports.view'>
            <Link
              to={`/projects/${projectId}/reports`}
              className='rounded-md border border-border px-3 py-1.5 text-sm font-medium text-fg-body transition-colors hover:bg-surface-muted'
            >
              Report
            </Link>
          </PermissionGate>
          <PermissionGate permission='projects.edit'>
            <Link
              to={`/projects/${projectId}/setup`}
              className='rounded-md border border-border px-3 py-1.5 text-sm font-medium text-fg-body transition-colors hover:bg-surface-muted'
            >
              Edit
            </Link>
          </PermissionGate>
          <CloseProjectButton
            projectId={projectId}
            status={project.data.status}
          />
        </div>
      </div>

      <ProjectOverviewCard overview={overview.data} />
    </div>
  );
}
