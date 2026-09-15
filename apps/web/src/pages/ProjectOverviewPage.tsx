import { useParams } from 'react-router-dom';

import { PageHeader } from '@/components/shared';
import { ProjectOverviewContainer } from '@/features/projects';

export function ProjectOverviewPage() {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <main aria-labelledby='project-overview-title'>
      <PageHeader
        id='project-overview-title'
        title='Project Overview'
        description='Progress, health, staffing, and tickets at a glance.'
        backTo={{ to: '/projects', label: 'Back to Projects' }}
      />
      {projectId ? (
        <ProjectOverviewContainer projectId={projectId} />
      ) : (
        <p className='text-sm text-fg-muted'>No project selected.</p>
      )}
    </main>
  );
}
