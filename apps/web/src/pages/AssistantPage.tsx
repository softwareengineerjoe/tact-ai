import { PageHeader } from '@/components/shared';
import { AssistantContainer } from '@/features/assistant';

export function AssistantPage() {
  return (
    <main aria-labelledby='assistant-title'>
      <PageHeader
        id='assistant-title'
        title='TACT AI Assistant'
        description='Ask about projects, people, capacity, and tickets. Answers use only data you are authorized to see.'
      />
      <AssistantContainer />
    </main>
  );
}
