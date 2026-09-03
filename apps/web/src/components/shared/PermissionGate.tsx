import type { ReactNode } from 'react';

import {
  useHasAllPermissions,
  useHasAnyPermission,
} from '@/hooks/usePermissions';
import type { Permission } from '@/types/permissions';

interface PermissionGateProps {
  permission: Permission | readonly Permission[];
  mode?: 'all' | 'any';
  fallback?: ReactNode;
  children: ReactNode;
}

/** Renders children only when the caller holds the required permission(s). */
export function PermissionGate({
  permission,
  mode = 'all',
  fallback = null,
  children,
}: PermissionGateProps) {
  const hasAll = useHasAllPermissions();
  const hasAny = useHasAnyPermission();
  const required = Array.isArray(permission) ? permission : [permission];
  const granted = mode === 'any' ? hasAny(required) : hasAll(required);
  return <>{granted ? children : fallback}</>;
}
