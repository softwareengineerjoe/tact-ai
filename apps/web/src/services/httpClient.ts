import { z } from 'zod';

const API_BASE = '/api/v1';

export interface ApiError extends Error {
  status: number;
  code: string;
  correlationId?: string;
}

function createApiError(
  status: number,
  code: string,
  message: string,
  correlationId?: string,
): ApiError {
  const error = new Error(message) as ApiError;
  error.name = 'ApiError';
  error.status = status;
  error.code = code;
  error.correlationId = correlationId;
  return error;
}

const ErrorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    correlationId: z.string().nullish(),
  }),
});

async function toApiError(response: Response): Promise<ApiError> {
  const correlationId = response.headers.get('X-Correlation-Id') ?? undefined;
  try {
    const parsed = ErrorEnvelopeSchema.parse(await response.json());
    return createApiError(
      response.status,
      parsed.error.code,
      parsed.error.message,
      parsed.error.correlationId ?? correlationId,
    );
  } catch {
    return createApiError(
      response.status,
      'unexpected_error',
      response.statusText || 'Request failed',
      correlationId,
    );
  }
}

export async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Correlation-Id': crypto.randomUUID(),
      ...init?.headers,
    },
  });
  if (!response.ok) throw await toApiError(response);
  return schema.parse(await response.json());
}
