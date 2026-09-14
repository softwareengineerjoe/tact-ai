import { useRef, useState } from 'react';

import { PermissionGate, toast } from '@/components/shared';
import { useCreateImport } from '../api/useCreateImport';
import { ImportResultView } from '../components/ImportResultView';
import type { ImportJob } from '../types';

const REQUIRED_COLUMNS = 'employee_code, display_name, email';

/**
 * Owns the employee CSV import flow: pick a file, submit, and review the
 * per-row result. Mutations resolve to a visible success/error (MASTER FR-019).
 */
export function ImportEmployeesContainer() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [job, setJob] = useState<ImportJob | null>(null);
  const createImport = useCreateImport();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFilename(null);
      setContent(null);
      return;
    }
    setFilename(file.name);
    setContent(await file.text());
    setJob(null);
  };

  const handleSubmit = () => {
    if (!filename || !content) return;
    createImport.mutate(
      { kind: 'employees', filename, content },
      {
        onSuccess: (result) => {
          setJob(result);
          if (result.status === 'failed') {
            toast.error('The import could not be processed.');
          } else {
            toast.success(
              `Imported ${result.created_count} new and ${result.updated_count} updated employees.`,
            );
          }
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const handleReset = () => {
    setFilename(null);
    setContent(null);
    setJob(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className='space-y-6'>
      <PermissionGate
        permission='people.edit'
        fallback={
          <p className='rounded-lg border border-border bg-surface p-4 text-sm text-fg-muted'>
            You do not have permission to import employees.
          </p>
        }
      >
        <div className='rounded-lg border border-border bg-surface p-5 shadow-xs'>
          <h2 className='text-base font-semibold text-fg'>
            Import employees from CSV
          </h2>
          <p className='mt-1 text-sm text-fg-muted'>
            The file must include a header row with {REQUIRED_COLUMNS}. Existing
            employees are matched and updated by employee code.
          </p>

          <div className='mt-4 flex flex-wrap items-center gap-3'>
            <label className='inline-flex cursor-pointer items-center rounded-md border border-border px-3 py-1.5 text-sm font-medium text-fg-body transition-colors hover:bg-surface-muted'>
              <input
                ref={inputRef}
                type='file'
                accept='.csv,text/csv'
                onChange={handleFileChange}
                className='sr-only'
              />
              Choose CSV file
            </label>
            {filename ? (
              <span className='text-sm text-fg-body'>{filename}</span>
            ) : (
              <span className='text-sm text-fg-muted'>No file selected</span>
            )}
          </div>

          <div className='mt-4 flex items-center gap-2'>
            <button
              type='button'
              onClick={handleSubmit}
              disabled={!content || createImport.isPending}
              className='rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg transition-colors hover:bg-primary-hover disabled:opacity-60'
            >
              {createImport.isPending ? 'Importing…' : 'Run import'}
            </button>
            {filename ? (
              <button
                type='button'
                onClick={handleReset}
                className='rounded-md border border-border px-4 py-2 text-sm font-medium text-fg-body transition-colors hover:bg-surface-muted'
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>

        {job ? <ImportResultView job={job} /> : null}
      </PermissionGate>
    </div>
  );
}
