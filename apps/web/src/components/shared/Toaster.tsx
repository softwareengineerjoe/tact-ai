import { useSyncExternalStore } from 'react';

import { cn } from '@/utils/cn';
import { getToasts, subscribeToasts } from './toastStore';

/** Global toast viewport. Mount once in the app shell. */
export function Toaster() {
  const items = useSyncExternalStore(subscribeToasts, getToasts);

  return (
    <div
      aria-live='polite'
      className='pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2'
    >
      {items.map((item) => (
        <div
          key={item.id}
          role={item.tone === 'error' ? 'alert' : 'status'}
          className={cn(
            'pointer-events-auto flex items-start gap-2 rounded-md border px-4 py-3 text-sm shadow-sm',
            item.tone === 'success'
              ? 'border-primary/30 bg-primary-subtle text-primary'
              : 'border-danger/30 bg-surface text-danger',
          )}
        >
          <span
            aria-hidden
            className='mt-0.5 h-2 w-2 shrink-0 rounded-full bg-current'
          />
          <span className='text-fg-body'>{item.message}</span>
        </div>
      ))}
    </div>
  );
}
