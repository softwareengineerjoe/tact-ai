import type { ImportJob } from '@/features/imports/types';

interface ImportResultViewProps {
  job: ImportJob;
}

const ROW_TONE: Record<ImportJob['rows'][number]['status'], string> = {
  created: 'text-success',
  updated: 'text-info',
  skipped: 'text-fg-muted',
  invalid: 'text-danger',
};

const ROW_ICON: Record<ImportJob['rows'][number]['status'], string> = {
  created: '＋',
  updated: '↻',
  skipped: '–',
  invalid: '▲',
};

/** Presentational summary + per-row results of an import job (FR-019). Pure. */
export function ImportResultView({ job }: ImportResultViewProps) {
  const invalidRows = job.rows.filter((row) => row.status === 'invalid');

  return (
    <section aria-labelledby='import-result' className='space-y-4'>
      <h2 id='import-result' className='text-sm font-semibold text-fg-muted'>
        Import result — {job.filename}
      </h2>

      {job.status === 'failed' ? (
        <p
          role='alert'
          className='rounded-lg border border-danger/30 bg-surface p-4 text-sm text-danger'
        >
          {job.error ?? 'The import failed.'}
        </p>
      ) : (
        <dl className='grid grid-cols-2 gap-3 md:grid-cols-4'>
          <Metric label='Total rows' value={job.total_rows} />
          <Metric
            label='Created'
            value={job.created_count}
            tone='text-success'
          />
          <Metric label='Updated' value={job.updated_count} tone='text-info' />
          <Metric
            label='Invalid'
            value={job.invalid_count}
            tone={job.invalid_count > 0 ? 'text-danger' : undefined}
          />
        </dl>
      )}

      {invalidRows.length > 0 ? (
        <div>
          <h3 className='mb-2 text-sm font-semibold text-fg-muted'>
            Rows needing attention
          </h3>
          <ul className='space-y-1'>
            {invalidRows.map((row) => (
              <li
                key={row.row_number}
                className='flex items-start gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg-body'
              >
                <span aria-hidden className={ROW_TONE[row.status]}>
                  {ROW_ICON[row.status]}
                </span>
                <span>
                  Row {row.row_number}
                  {row.identifier ? ` (${row.identifier})` : ''}: {row.message}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <div className='rounded-lg border border-border bg-surface p-3'>
      <dt className='text-xs text-fg-muted'>{label}</dt>
      <dd
        className={`mt-1 text-xl font-semibold tabular-nums ${tone ?? 'text-fg'}`}
      >
        {value}
      </dd>
    </div>
  );
}
