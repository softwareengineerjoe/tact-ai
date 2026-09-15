import { cn } from '@/utils/cn';
import type { LoadingStateProps } from './types';

/** Calm loading state. Prefers skeletons for content areas (DESIGN_GUIDELINES section 8). */
export function LoadingState({
  label,
  variant = 'skeleton',
  rows = 3,
  className,
}: LoadingStateProps) {
  // Per-page content: shimmering skeleton rows that mirror the layout.
  if (variant === 'skeleton') {
    return (
      <div
        role='status'
        aria-live='polite'
        aria-busy='true'
        className={cn('space-y-3', className)}
      >
        <span className='sr-only'>{label}</span>
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className='relative h-12 overflow-hidden rounded-md bg-surface-muted'
          >
            <span
              aria-hidden
              className='animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent'
            />
          </div>
        ))}
      </div>
    );
  }

  // Inline: compact spinner for in-button / in-row use (no layout takeover).
  if (variant === 'inline') {
    return (
      <span
        role='status'
        aria-live='polite'
        aria-busy='true'
        className={cn('inline-flex items-center gap-2', className)}
      >
        <Spinner className='h-4 w-4' />
        <span className='text-sm text-fg-muted'>{label}</span>
      </span>
    );
  }

  // Block: a centered "normal loading page" that fills the available space.
  return (
    <div
      role='status'
      aria-live='polite'
      aria-busy='true'
      className={cn(
        'flex min-h-[16rem] w-full flex-1 flex-col items-center justify-center gap-3 py-12 text-center',
        className,
      )}
    >
      <Spinner className='h-8 w-8' />
      <p className='text-sm font-medium text-fg-muted'>{label}</p>
    </div>
  );
}

function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'animate-spin rounded-full border-2 border-primary/25 border-t-primary',
        className,
      )}
    />
  );
}
