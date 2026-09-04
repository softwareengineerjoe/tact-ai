import { useState } from 'react';

interface ChatComposerProps {
  onSend: (content: string) => void;
  isSending?: boolean;
}

/** Presentational message composer. Submits non-empty text and clears itself. */
export function ChatComposer({ onSend, isSending = false }: ChatComposerProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (trimmed === '' || isSending) return;
    onSend(trimmed);
    setValue('');
  };

  return (
    <form onSubmit={handleSubmit} className='flex items-end gap-2'>
      <label htmlFor='assistant-input' className='sr-only'>
        Ask about projects, people, or tickets
      </label>
      <textarea
        id='assistant-input'
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) handleSubmit(event);
        }}
        rows={2}
        placeholder='Ask about projects, people, or tickets…'
        className='flex-1 resize-none rounded-md border border-border bg-surface p-3 text-sm text-fg-body focus:outline-none focus:ring-2 focus:ring-primary-hover'
      />
      <button
        type='submit'
        disabled={isSending || value.trim() === ''}
        className='h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-fg hover:bg-primary-hover disabled:bg-surface-muted disabled:text-fg-muted'
      >
        {isSending ? 'Sending…' : 'Send'}
      </button>
    </form>
  );
}
