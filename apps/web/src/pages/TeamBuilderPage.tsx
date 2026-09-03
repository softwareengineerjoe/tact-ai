import { useParams } from 'react-router-dom';

import { PageHeader } from '@/components/shared';
import { TeamBuilderContainer } from '@/features/team-builder';

export function TeamBuilderPage() {
  const { projectId } = useParams<{ projectId: string }>();

  if (!projectId) {
    return (
      <main aria-labelledby='team-builder-title'>
        <PageHeader id='team-builder-title' title='Team Builder' />
        <p className='text-sm text-fg-muted'>No project selected.</p>
      </main>
    );
  }

  return (
    <main aria-labelledby='team-builder-title'>
      <PageHeader id='team-builder-title' title='Team Builder' />
      <TeamBuilderContainer projectId={projectId} />
    </main>
  );
}
