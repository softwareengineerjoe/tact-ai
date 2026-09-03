import { useParams } from 'react-router-dom';

import { PageHeader } from '@/components/shared';
import { ProjectSetupContainer } from '@/features/requirements';

export function ProjectSetupPage() {
  const { projectId } = useParams<{ projectId: string }>();

  if (!projectId) {
    return (
      <main aria-labelledby='project-setup-title'>
        <PageHeader id='project-setup-title' title='Project Setup' />
        <p className='text-sm text-fg-muted'>No project selected.</p>
      </main>
    );
  }

  return (
    <main aria-labelledby='project-setup-title'>
      <PageHeader
        id='project-setup-title'
        title='Project Setup'
        description='Set the schedule and define the roles this project needs.'
      />
      <ProjectSetupContainer projectId={projectId} />
    </main>
  );
}
