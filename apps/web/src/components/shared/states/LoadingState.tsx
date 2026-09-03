import { cn } from '@/utils/cn';
import type { LoadingStateProps } from './types';

/** Calm loading state. Prefers skeletons for content areas (DESIGN_GUIDELINES section 8). */
export function LoadingState({
  label,
  variant = 'skeleton',
  rows = 3,
  className,
}: LoadingStateProps) {
  return (
    <div
      role='status'
      aria-live='polite'
      aria-busy='true'
      className={cn('space-y-3', className)}
    >
      <span className='sr-only'>{label}</span>
      {variant === 'skeleton' ? (
        Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className='h-12 animate-pulse rounded-md bg-surface-muted'
          />
        ))
      ) : (
        <div className='h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent' />
      )}
    </div>
  );
}
