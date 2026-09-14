import type { ProjectProgress } from '@/features/projects/types';

interface ProgressBarProps {
  progress: ProjectProgress;
}

const METHOD_LABEL: Record<ProjectProgress['method'], string> = {
  story_points: 'by story points',
  tickets: 'by tickets completed',
};

/** Presentational deterministic progress bar (MASTER FR-013). Pure. */
export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div>
      <div className='flex items-baseline justify-between gap-2'>
        <span className='text-3xl font-semibold tabular-nums text-fg'>
          {progress.percent}%
        </span>
        <span className='text-xs text-fg-muted'>
          {progress.completed} / {progress.total}{' '}
          {METHOD_LABEL[progress.method]}
        </span>
      </div>
      <div
        role='progressbar'
        aria-valuenow={progress.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label='Project progress'
        className='mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-muted'
      >
        <div
          className='h-full rounded-full bg-primary transition-all'
          style={{ width: `${progress.percent}%` }}
        />
      </div>
    </div>
  );
}
