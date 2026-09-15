import { AssistantAvatar } from './AssistantAvatar';

interface AssistantWelcomeProps {
  /** Send a suggested prompt straight into the conversation. */
  onPick: (prompt: string) => void;
}

interface Suggestion {
  label: string;
  prompt: string;
}

// Grounded in what the read-only assistant can actually answer (MASTER FR-020).
const SUGGESTIONS: readonly Suggestion[] = [
  { label: 'Active projects', prompt: 'Which projects are currently active?' },
  { label: 'Who is available?', prompt: 'Who is available for a new project?' },
  { label: 'Blocked tickets', prompt: 'Which tickets are currently blocked?' },
  { label: 'Staffing gaps', prompt: 'Which project roles are still unfilled?' },
  {
    label: 'Overallocated people',
    prompt: 'Show everyone above 90% allocation.',
  },
  { label: 'Weekly summary', prompt: 'Create a weekly status summary.' },
];

/** Premium, mascot-led empty state that invites the first question. */
export function AssistantWelcome({ onPick }: AssistantWelcomeProps) {
  return (
    <div className='animate-fade-in flex flex-col items-center px-4 py-8 text-center'>
      <AssistantAvatar size={72} />

      <h2 className='mt-4 text-lg font-semibold text-fg'>Hi, I&rsquo;m Tia</h2>
      <p className='mt-1.5 max-w-md text-sm text-fg-muted'>
        Your TACT AI companion. Ask about projects, people, capacity, and
        tickets — I only use data you&rsquo;re authorized to see.
      </p>

      <div className='stagger mt-5 flex max-w-lg flex-wrap justify-center gap-1.5'>
        {SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            type='button'
            onClick={() => onPick(s.prompt)}
            className='group inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-surface/80 px-3 py-1.5 text-xs font-medium text-fg-body backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary-subtle hover:text-primary hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover'
          >
            <span
              aria-hidden
              className='h-1 w-1 rounded-full bg-primary/40 transition-colors group-hover:bg-primary'
            />
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
