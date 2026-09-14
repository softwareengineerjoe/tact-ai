import { cn } from '@/utils/cn';
import type { ProjectHealth } from '@/features/projects/types';

interface HealthBadgeProps {
  status: ProjectHealth['status'];
  className?: string;
}

// Status must pair color with an icon + label, never color alone (DESIGN §2.3).
const HEALTH: Record<
  ProjectHealth['status'],
  { label: string; icon: string; classes: string }
> = {
  green: {
    label: 'On track',
    icon: '●',
    classes: 'bg-primary-subtle text-success',
  },
  amber: {
    label: 'At risk',
    icon: '▲',
    classes: 'bg-[#FBF3E0] text-warning',
  },
  red: {
    label: 'Critical',
    icon: '■',
    classes: 'bg-[#FBECEC] text-danger',
  },
};

/** Presentational rule-based project health pill (MASTER FR-014). Pure. */
export function HealthBadge({ status, className }: HealthBadgeProps) {
  const health = HEALTH[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        health.classes,
        className,
      )}
    >
      <span aria-hidden>{health.icon}</span>
      {health.label}
    </span>
  );
}
