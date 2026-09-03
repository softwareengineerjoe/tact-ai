import { cn } from '@/utils/cn';
import type { ErrorStateProps } from './types';

/** Error state pairs an icon + label (never color alone) and surfaces the correlation id. */
export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  const correlationId =
    'correlationId' in error
      ? (error as { correlationId?: string }).correlationId
      : undefined;
  return (
    <div
      role='alert'
      className={cn(
        'flex flex-col items-center gap-3 rounded-lg border border-danger/30 bg-surface p-8 text-center',
        className,
      )}
    >
      <span aria-hidden className='text-2xl text-danger'>
        ⚠
      </span>
      <h2 className='text-lg font-semibold text-fg'>Something went wrong</h2>
      <p className='text-sm text-fg-muted'>{error.message}</p>
      {correlationId ? (
        <p className='text-xs text-fg-muted'>Reference: {correlationId}</p>
      ) : null}
      {onRetry ? (
        <button
          type='button'
          onClick={onRetry}
          className='mt-1 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-surface-muted'
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}
