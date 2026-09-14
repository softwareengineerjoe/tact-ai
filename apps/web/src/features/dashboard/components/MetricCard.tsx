import { cn } from '@/utils/cn';

type MetricTone = 'default' | 'success' | 'warning' | 'danger';

interface MetricCardProps {
  label: string;
  value: number;
  hint?: string;
  tone?: MetricTone;
  className?: string;
}

const TONE_VALUE: Record<MetricTone, string> = {
  default: 'text-fg',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
};

const TONE_ACCENT: Record<MetricTone, string> = {
  default: 'bg-border',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

/** Presentational metric tile for the management overview. */
export function MetricCard({
  label,
  value,
  hint,
  tone = 'default',
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border border-border bg-surface p-4 pl-5 shadow-xs transition-shadow hover:shadow-sm',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn('absolute inset-y-0 left-0 w-1', TONE_ACCENT[tone])}
      />
      <p className='text-sm font-medium text-fg-muted'>{label}</p>
      <p
        className={cn(
          'mt-1 text-3xl font-semibold tabular-nums',
          TONE_VALUE[tone],
        )}
      >
        {value}
      </p>
      {hint ? <p className='mt-1 text-xs text-fg-muted'>{hint}</p> : null}
    </div>
  );
}
