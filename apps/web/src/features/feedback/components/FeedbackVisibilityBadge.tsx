import { cn } from '@/utils/cn';
import type { FeedbackVisibility } from '@/features/feedback/types';
import { FEEDBACK_VISIBILITY_LABELS } from '../utils';

interface FeedbackVisibilityBadgeProps {
  visibility: FeedbackVisibility;
  className?: string;
}

const TONE: Record<FeedbackVisibility, string> = {
  manager_only: 'bg-[#FBF3E0] text-warning',
  manager_and_employee: 'bg-primary-subtle text-primary',
  project_leadership: 'bg-surface-muted text-fg-body',
  hr_partner: 'bg-surface-muted text-fg-body',
};

/** Visibility pill — pairs an icon/label, never color alone. */
export function FeedbackVisibilityBadge({
  visibility,
  className,
}: FeedbackVisibilityBadgeProps) {
  const isPrivate = visibility === 'manager_only';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        TONE[visibility],
        className,
      )}
    >
      <span aria-hidden>{isPrivate ? '🔒' : '•'}</span>
      {FEEDBACK_VISIBILITY_LABELS[visibility]}
    </span>
  );
}
