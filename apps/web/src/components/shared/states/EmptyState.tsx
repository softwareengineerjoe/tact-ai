import { cn } from '@/utils/cn';
import type { EmptyStateProps } from './types';
import { PermissionGate } from '../PermissionGate';

/** Calm, high-contrast medallion shown when no custom icon is provided. */
function DefaultIllustration() {
  return (
    <span className='animate-float relative flex h-20 w-20 items-center justify-center'>
      <span
        aria-hidden
        className='absolute inset-0 rounded-full bg-primary-subtle'
      />
      <span
        aria-hidden
        className='absolute inset-2 rounded-full bg-primary/10'
      />
      <svg
        viewBox='0 0 24 24'
        className='relative h-9 w-9 text-primary'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.6'
        strokeLinecap='round'
        strokeLinejoin='round'
        aria-hidden
      >
        <rect x='4' y='5' width='16' height='14' rx='2.5' />
        <path d='M4 9h16' />
        <path d='M8 13h8M8 16h5' />
      </svg>
    </span>
  );
}

/** Designed empty state with an optional (permission-gated) primary action. */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'animate-scale-in flex flex-col items-center gap-3 rounded-lg border border-border bg-surface p-10 text-center shadow-xs',
        className,
      )}
    >
      <div aria-hidden className='text-fg-muted'>
        {icon ?? <DefaultIllustration />}
      </div>
      <h2 className='text-lg font-semibold text-fg'>{title}</h2>
      {description ? (
        <p className='max-w-prose text-sm text-fg-muted'>{description}</p>
      ) : null}
      {action ? (
        <PermissionGate
          permission={action.permission ? [action.permission] : []}
        >
          <button
            type='button'
            onClick={action.onClick}
            className='mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg shadow-sm transition-colors hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover focus-visible:ring-offset-2 focus-visible:ring-offset-surface'
          >
            {action.label}
          </button>
        </PermissionGate>
      ) : null}
    </div>
  );
}
