import { cn } from '@/utils/cn';
import type { EmploymentStatus } from '@/features/people/types';

const STATUS_LABEL: Record<EmploymentStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  on_leave: 'On leave',
  unavailable: 'Unavailable',
  archived: 'Archived',
};

const STATUS_TONE: Record<EmploymentStatus, string> = {
  active: 'bg-primary-subtle text-primary',
  inactive: 'bg-surface-muted text-fg-muted',
  on_leave: 'bg-[#FBF3E0] text-warning',
  unavailable: 'bg-[#FBF3E0] text-warning',
  archived: 'bg-surface-muted text-fg-muted',
};

interface EmploymentStatusBadgeProps {
  status: EmploymentStatus;
  className?: string;
}

export function EmploymentStatusBadge({
  status,
  className,
}: EmploymentStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        STATUS_TONE[status],
        className,
      )}
    >
      <span aria-hidden className='h-1.5 w-1.5 rounded-full bg-current' />
      {STATUS_LABEL[status]}
    </span>
  );
}
