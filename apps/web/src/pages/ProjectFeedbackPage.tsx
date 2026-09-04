import { useParams } from 'react-router-dom';

import { PageHeader } from '@/components/shared';
import { ProjectFeedbackContainer } from '@/features/feedback';

export function ProjectFeedbackPage() {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <main aria-labelledby='feedback-title'>
      <PageHeader id='feedback-title' title='Feedback' />
      <ProjectFeedbackContainer projectId={projectId ?? ''} />
    </main>
  );
}
