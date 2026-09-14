import { useState } from 'react';

interface ChatComposerProps {
  onSend: (content: string) => void;
  isSending?: boolean;
}

/** Presentational message composer. Submits non-empty text and clears itself. */
export function ChatComposer({ onSend, isSending = false }: ChatComposerProps) {
  const [value, setValue] = useState('');
  const canSend = value.trim() !== '' && !isSending;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (trimmed === '' || isSending) return;
    onSend(trimmed);
    setValue('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='group relative rounded-2xl border border-border bg-surface p-2 shadow-sm transition-shadow focus-within:border-primary/40 focus-within:shadow-md'
    >
      <label htmlFor='assistant-input' className='sr-only'>
        Ask about projects, people, or tickets
      </label>
      <div className='flex items-end gap-2'>
        <textarea
          id='assistant-input'
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) handleSubmit(event);
          }}
          rows={1}
          placeholder='Ask about projects, people, or tickets…'
          className='max-h-40 min-h-[2.75rem] flex-1 resize-none bg-transparent px-2 py-2.5 text-sm text-fg-body placeholder:text-fg-muted focus:outline-none'
        />
        <button
          type='submit'
          disabled={!canSend}
          aria-label='Send message'
          className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-fg shadow-sm transition-all hover:bg-primary-hover disabled:bg-surface-muted disabled:text-fg-muted disabled:shadow-none enabled:hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover focus-visible:ring-offset-2 focus-visible:ring-offset-surface'
        >
          {isSending ? (
            <span className='h-4 w-4 animate-spin rounded-full border-2 border-primary-fg/40 border-t-primary-fg' />
          ) : (
            <SendIcon />
          )}
        </button>
      </div>
      <p className='px-2 pb-1 pt-0.5 text-xs text-fg-muted'>
        Press{' '}
        <kbd className='rounded bg-surface-muted px-1 font-sans'>Enter</kbd> to
        send ·{' '}
        <kbd className='rounded bg-surface-muted px-1 font-sans'>Shift</kbd>+
        <kbd className='rounded bg-surface-muted px-1 font-sans'>Enter</kbd> for
        a new line
      </p>
    </form>
  );
}

function SendIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      className='h-5 w-5'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden
    >
      <path d='m22 2-7 20-4-9-9-4Z' />
      <path d='M22 2 11 13' />
    </svg>
  );
}
