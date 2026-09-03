import { cn } from '@/utils/cn';
import type { ForbiddenStateProps } from './types';

/** Shown when the caller lacks the required permission(s) (FRONTEND_STANDARDS 7A). */
export function ForbiddenState({
  requiredPermissions,
  className,
}: ForbiddenStateProps) {
  return (
    <div
      role='alert'
      className={cn(
        'flex flex-col items-center gap-3 rounded-lg border border-border bg-surface p-8 text-center',
        className,
      )}
    >
      <span aria-hidden className='text-2xl text-fg-muted'>
        🔒
      </span>
      <h2 className='text-lg font-semibold text-fg'>
        You don&apos;t have access
      </h2>
      <p className='max-w-prose text-sm text-fg-muted'>
        You do not have permission to view this. Contact an administrator if you
        believe this is a mistake.
      </p>
      {requiredPermissions.length > 0 ? (
        <p className='text-xs text-fg-muted'>
          Requires: {requiredPermissions.join(', ')}
        </p>
      ) : null}
    </div>
  );
}
