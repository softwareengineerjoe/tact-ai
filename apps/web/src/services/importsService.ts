import { request } from '@/services/httpClient';
import { ImportJobSchema } from '@/features/imports/schemas';
import type { CreateImportInput } from '@/features/imports/types';

export const importsService = {
  create: (input: CreateImportInput) =>
    request('/imports', ImportJobSchema, {
      method: 'POST',
      headers: { 'Idempotency-Key': crypto.randomUUID() },
      body: JSON.stringify(input),
    }),
};
