import { useMutation } from '@tanstack/react-query';

import { importsService } from '@/services/importsService';
import type { ApiError } from '@/services/httpClient';
import type { CreateImportInput, ImportJob } from '@/features/imports/types';

/** Upload and run an employee CSV import (MASTER FR-019). */
export function useCreateImport() {
  return useMutation<ImportJob, ApiError, CreateImportInput>({
    mutationFn: (input) => importsService.create(input),
  });
}
