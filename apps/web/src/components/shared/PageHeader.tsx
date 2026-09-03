import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

interface PageHeaderProps {
  id?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  id,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn('mb-6 flex items-start justify-between gap-4', className)}
    >
      <div>
        <h1 id={id} className='text-2xl font-semibold text-fg'>
          {title}
        </h1>
        {description ? (
          <p className='mt-1 text-sm text-fg-muted'>{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className='flex items-center gap-2'>{actions}</div>
      ) : null}
    </header>
  );
}
