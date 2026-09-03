import { z } from 'zod';

import { PERMISSIONS } from '@/types/permissions';
import { request } from './httpClient';

const PermissionSchema = z.enum(PERMISSIONS);

export const SessionSchema = z.object({
  user_id: z.string().uuid(),
  organization_id: z.string().uuid(),
  roles: z.array(z.string()),
  permissions: z.array(PermissionSchema),
});

export type SessionResponse = z.infer<typeof SessionSchema>;

export const sessionService = {
  me: (signal?: AbortSignal) => request('/me', SessionSchema, { signal }),
};
