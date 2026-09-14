import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

interface PageHeaderProps {
  id?: string;
  title: string;
  description?: string;
  /** Small uppercase label above the title for context. */
  eyebrow?: string;
  /** Decorative leading icon shown beside the title. */
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  id,
  title,
  description,
  eyebrow,
  icon,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'animate-fade-in mb-6 flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className='flex items-start gap-3'>
        {icon ? (
          <span
            aria-hidden
            className='mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-primary'
          >
            {icon}
          </span>
        ) : null}
        <div>
          {eyebrow ? (
            <p className='text-xs font-semibold uppercase tracking-wide text-primary'>
              {eyebrow}
            </p>
          ) : null}
          <h1 id={id} className='text-2xl font-semibold tracking-tight text-fg'>
            {title}
          </h1>
          {description ? (
            <p className='mt-1 max-w-2xl text-sm text-fg-muted'>
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className='flex shrink-0 items-center gap-2'>{actions}</div>
      ) : null}
    </header>
  );
}
