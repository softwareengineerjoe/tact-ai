import { z } from 'zod';

export const ImportRowStatusSchema = z.enum([
  'created',
  'updated',
  'skipped',
  'invalid',
]);

export const ImportStatusSchema = z.enum([
  'pending',
  'processing',
  'completed',
  'failed',
]);

export const ImportRowResultSchema = z.object({
  row_number: z.number().int().nonnegative(),
  status: ImportRowStatusSchema,
  identifier: z.string().nullable(),
  message: z.string().nullable(),
});

export const ImportJobSchema = z.object({
  id: z.string().uuid(),
  kind: z.enum(['employees']),
  filename: z.string(),
  status: ImportStatusSchema,
  total_rows: z.number().int().nonnegative(),
  created_count: z.number().int().nonnegative(),
  updated_count: z.number().int().nonnegative(),
  invalid_count: z.number().int().nonnegative(),
  error: z.string().nullable(),
  created_at: z.string().datetime(),
  rows: z.array(ImportRowResultSchema),
});

export const CreateImportSchema = z.object({
  kind: z.literal('employees').default('employees'),
  filename: z.string().min(1),
  content: z.string().min(1),
});
