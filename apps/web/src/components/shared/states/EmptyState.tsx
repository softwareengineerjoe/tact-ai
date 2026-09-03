import { cn } from '@/utils/cn';
import type { EmptyStateProps } from './types';
import { PermissionGate } from '../PermissionGate';

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
        'flex flex-col items-center gap-3 rounded-lg border border-border bg-surface p-8 text-center',
        className,
      )}
    >
      {icon ? (
        <div aria-hidden className='text-fg-muted'>
          {icon}
        </div>
      ) : null}
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
            className='mt-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:bg-primary-hover'
          >
            {action.label}
          </button>
        </PermissionGate>
      ) : null}
    </div>
  );
}
