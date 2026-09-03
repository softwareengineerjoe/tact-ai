import { createContext, useContext } from 'react';

import type { Permission } from '@/types/permissions';

export interface Session {
  userId: string;
  organizationId: string;
  roles: string[];
  permissions: Permission[];
}

export const SessionContext = createContext<Session | null>(null);

/** Returns the authenticated session. Throws if used outside the provider. */
export function useSession(): Session {
  const session = useContext(SessionContext);
  if (session === null) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return session;
}
