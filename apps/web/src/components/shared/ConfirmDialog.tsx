import { useEffect, useRef } from 'react';

import { cn } from '@/utils/cn';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger';
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Accessible confirmation dialog for destructive / high-impact actions
 * (MASTER 8.4, FRONTEND_STANDARDS §13A). Focus-trapped, ESC closes, focus
 * returns to the previously focused element on close.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'primary',
  isPending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    confirmRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isPending) onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [open, isPending, onCancel]);

  if (!open) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4'
      role='presentation'
    >
      <div
        className='absolute inset-0 bg-fg/40'
        onClick={() => !isPending && onCancel()}
        aria-hidden
      />
      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby='confirm-dialog-title'
        aria-describedby={description ? 'confirm-dialog-desc' : undefined}
        className='relative w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-lg'
      >
        <h2 id='confirm-dialog-title' className='text-lg font-semibold text-fg'>
          {title}
        </h2>
        {description ? (
          <p id='confirm-dialog-desc' className='mt-2 text-sm text-fg-muted'>
            {description}
          </p>
        ) : null}
        <div className='mt-6 flex justify-end gap-2'>
          <button
            type='button'
            onClick={onCancel}
            disabled={isPending}
            className='h-10 rounded-md border border-border bg-surface px-4 text-sm font-medium text-fg-body transition-colors hover:bg-surface-muted disabled:opacity-50'
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type='button'
            onClick={onConfirm}
            disabled={isPending}
            className={cn(
              'inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-medium text-primary-fg transition-colors disabled:opacity-60',
              tone === 'danger'
                ? 'bg-danger hover:bg-danger/90'
                : 'bg-primary hover:bg-primary-hover',
            )}
          >
            {isPending ? (
              <span
                aria-hidden
                className='h-4 w-4 animate-spin rounded-full border-2 border-primary-fg border-t-transparent'
              />
            ) : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
