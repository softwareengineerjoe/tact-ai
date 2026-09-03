import { cn } from '@/utils/cn';

interface FitScoreBadgeProps {
  score: number;
  className?: string;
}

/**
 * Project Fit Score badge (MASTER FR-009). Tone is a visual aid only and is
 * always paired with the numeric label — never color alone (DESIGN_GUIDELINES).
 */
export function FitScoreBadge({ score, className }: FitScoreBadgeProps) {
  const tone =
    score >= 80
      ? 'bg-primary-subtle text-primary'
      : score >= 60
        ? 'bg-[#FBF3E0] text-warning'
        : 'bg-surface-muted text-fg-muted';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums',
        tone,
        className,
      )}
    >
      <span aria-hidden className='h-1.5 w-1.5 rounded-full bg-current' />
      {score}
      <span className='sr-only'> Project Fit Score</span>
    </span>
  );
}
