import { PageHeader } from '@/components/shared';

export function AssistantPage() {
  return (
    <main aria-labelledby='assistant-title'>
      <PageHeader
        id='assistant-title'
        title='TACT AI Assistant'
        description='Ask about projects, people, capacity, and tickets.'
      />
      <p className='text-sm text-fg-muted'>
        The read-only assistant arrives in Sprint 5.
      </p>
    </main>
  );
}
