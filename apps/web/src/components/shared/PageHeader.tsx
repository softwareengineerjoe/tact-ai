import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { ArrowLeftIcon } from '@/components/icons';
import { cn } from '@/utils/cn';

interface PageHeaderProps {
  id?: string;
  title: string;
  description?: string;
  /** Small uppercase label above the title for context. */
  eyebrow?: string;
  /**
   * Optional back-navigation link rendered above the title. Provide the route
   * to return to and a descriptive label (e.g. "Back to Projects"). Give users
   * a clear way out of drill-down pages regardless of empty/error states.
   */
  backTo?: { to: string; label: string };
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
  backTo,
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
      <div className='min-w-0'>
        {backTo ? (
          <Link
            to={backTo.to}
            className='mb-2 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-fg-muted transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
          >
            <ArrowLeftIcon className='h-4 w-4' aria-hidden />
            {backTo.label}
          </Link>
        ) : null}
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
            <h1
              id={id}
              className='text-2xl font-semibold tracking-tight text-fg'
            >
              {title}
            </h1>
            {description ? (
              <p className='mt-1 max-w-2xl text-sm text-fg-muted'>
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      {actions ? (
        <div className='flex shrink-0 items-center gap-2'>{actions}</div>
      ) : null}
    </header>
  );
}
