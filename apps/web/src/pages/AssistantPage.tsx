import { AssistantAvatar, AssistantContainer } from '@/features/assistant';

export function AssistantPage() {
  return (
    <main
      aria-labelledby='assistant-title'
      className='flex h-[calc(100vh-7rem)] min-h-[30rem] flex-col gap-3 md:h-[calc(100vh-8rem)]'
    >
      {/* Compact hero: introduces Tia in a single slim row. */}
      <header className='animate-fade-in relative shrink-0 overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-br from-primary-active via-[#0c4030] to-[#08301f] px-3 py-2.5 text-primary-fg shadow-md sm:px-4'>
        <div
          aria-hidden
          className='animate-drift pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#3fa57b]/25 blur-3xl'
        />
        <div className='relative flex items-center gap-3'>
          <AssistantAvatar size={34} className='shrink-0' />
          <div className='min-w-0 flex-1'>
            <h1
              id='assistant-title'
              className='text-base font-semibold tracking-tight'
            >
              TACT AI Assistant
            </h1>
            <p className='mt-0.5 hidden truncate text-xs text-primary-fg/70 sm:block'>
              Ask about projects, people, capacity, and tickets — answers use
              only data you can see.
            </p>
          </div>
          <div className='hidden shrink-0 flex-wrap justify-end gap-1.5 lg:flex'>
            {['Projects', 'People', 'Capacity', 'Tickets'].map((tag) => (
              <span
                key={tag}
                className='rounded-full border border-primary-fg/20 bg-primary-fg/10 px-2.5 py-0.5 text-xs font-medium text-primary-fg/85'
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      <AssistantContainer className='min-h-0 flex-1' />
    </main>
  );
}
