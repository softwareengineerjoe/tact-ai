import { useParams } from 'react-router-dom';

import { PageHeader } from '@/components/shared';
import { WeeklyStatusReportContainer } from '@/features/reports';

export function ProjectReportPage() {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <main aria-labelledby='project-report-title'>
      <PageHeader
        id='project-report-title'
        title='Weekly Status Report'
        description='A deterministic snapshot of progress, health, risks, and highlights.'
        backTo={
          projectId
            ? { to: `/projects/${projectId}`, label: 'Back to Project' }
            : { to: '/projects', label: 'Back to Projects' }
        }
      />
      {projectId ? (
        <WeeklyStatusReportContainer projectId={projectId} />
      ) : (
        <p className='text-sm text-fg-muted'>No project selected.</p>
      )}
    </main>
  );
}
