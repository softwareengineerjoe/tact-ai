import type { z } from 'zod';

import type {
  CreateImportSchema,
  ImportJobSchema,
  ImportRowResultSchema,
} from './schemas';

export type ImportJob = z.infer<typeof ImportJobSchema>;
export type ImportRowResult = z.infer<typeof ImportRowResultSchema>;
export type CreateImportInput = z.infer<typeof CreateImportSchema>;
