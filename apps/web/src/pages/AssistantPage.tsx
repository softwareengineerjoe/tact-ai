import { AssistantAvatar, AssistantContainer } from '@/features/assistant';

export function AssistantPage() {
  return (
    <main
      aria-labelledby='assistant-title'
      className='flex h-[calc(100vh-7rem)] min-h-[30rem] flex-col gap-4 md:h-[calc(100vh-8rem)]'
    >
      {/* Compact hero: introduces Tia in a single readable row. */}
      <header className='animate-fade-in relative shrink-0 overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-br from-primary-active via-[#0c4030] to-[#08301f] px-4 py-3.5 text-primary-fg shadow-md sm:px-5'>
        <div
          aria-hidden
          className='animate-drift pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#3fa57b]/25 blur-3xl'
        />
        <div className='relative flex items-center gap-3 sm:gap-4'>
          <AssistantAvatar size={44} className='shrink-0' />
          <div className='min-w-0 flex-1'>
            <p className='text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-fg/60'>
              Meet Tia · Your AI companion
            </p>
            <h1
              id='assistant-title'
              className='text-lg font-semibold tracking-tight sm:text-xl'
            >
              TACT AI Assistant
            </h1>
            <p className='mt-0.5 hidden text-sm text-primary-fg/75 sm:block'>
              Ask about projects, people, capacity, and tickets. Answers use
              only the data you are authorized to see.
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
