import type { ReactNode } from 'react';

import { useQuery } from '@tanstack/react-query';

import { LoadingState } from '@/components/shared';
import { ErrorState } from '@/components/shared';
import { sessionService } from '@/services/sessionService';
import type { Permission } from '@/types/permissions';
import { SessionContext, type Session } from './useSession';

interface SessionProviderProps {
  children: ReactNode;
}

/** Loads the caller's session (identity + resolved permissions) once. */
export function SessionProvider({ children }: SessionProviderProps) {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['session'],
    queryFn: ({ signal }) => sessionService.me(signal),
    staleTime: 5 * 60 * 1000,
  });

  if (isPending) {
    return <LoadingState label='Loading your session' variant='block' />;
  }
  if (isError) {
    return <ErrorState error={error} onRetry={() => void refetch()} />;
  }

  const session: Session = {
    userId: data.user_id,
    organizationId: data.organization_id,
    roles: data.roles,
    permissions: data.permissions as Permission[],
  };

  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}
