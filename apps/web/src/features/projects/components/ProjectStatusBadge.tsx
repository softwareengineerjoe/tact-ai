import { cn } from '@/utils/cn';
import type { ProjectStatus } from '@/features/projects/types';

const STATUS_LABEL: Record<ProjectStatus, string> = {
  draft: 'Draft',
  staffing: 'Staffing',
  ready_for_approval: 'Ready for approval',
  active: 'Active',
  on_hold: 'On hold',
  closing: 'Closing',
  completed: 'Completed',
  archived: 'Archived',
};

// Status pairs a dot + label (never color alone) per DESIGN_GUIDELINES §2.3.
const STATUS_TONE: Record<ProjectStatus, string> = {
  draft: 'bg-surface-muted text-fg-muted',
  staffing: 'bg-primary-subtle text-primary',
  ready_for_approval: 'bg-primary-subtle text-primary',
  active: 'bg-primary-subtle text-primary',
  on_hold: 'bg-[#FBF3E0] text-warning',
  closing: 'bg-[#FBF3E0] text-warning',
  completed: 'bg-surface-muted text-fg-muted',
  archived: 'bg-surface-muted text-fg-muted',
};

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

export function ProjectStatusBadge({
  status,
  className,
}: ProjectStatusBadgeProps) {
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
