import {
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingState,
} from '@/components/shared';
import { useProjects } from '@/features/projects/api/useProjects';
import { ProjectCard } from '@/features/projects/components/ProjectCard';

interface ProjectListContainerProps {
  search?: string;
}

/** Owns data + the full data-fetch lifecycle (FRONTEND_STANDARDS §13A). */
export function ProjectListContainer({ search }: ProjectListContainerProps) {
  const { data, isPending, isError, error, refetch } = useProjects({ search });

  if (isPending)
    return (
      <LoadingState label='Loading projects' variant='skeleton' rows={4} />
    );
  if (isError && error.status === 403) {
    return <ForbiddenState requiredPermissions={['projects.view']} />;
  }
  if (isError)
    return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (data.items.length === 0) {
    return (
      <EmptyState
        title='No projects yet'
        description='Create your first project to start building a team.'
      />
    );
  }

  return (
    <ul className='grid gap-3 sm:grid-cols-2'>
      {data.items.map((project) => (
        <li key={project.id}>
          <ProjectCard project={project} />
        </li>
      ))}
    </ul>
  );
}
