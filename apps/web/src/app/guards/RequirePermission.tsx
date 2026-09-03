import type { ReactNode } from 'react';

import { useHasAllPermissions } from '@/hooks/usePermissions';
import { ForbiddenState } from '@/components/shared';
import type { Permission } from '@/types/permissions';

interface RequirePermissionProps {
  permission: Permission | readonly Permission[];
  children: ReactNode;
}

export function RequirePermission({
  permission,
  children,
}: RequirePermissionProps) {
  const hasAll = useHasAllPermissions();
  const required = Array.isArray(permission) ? permission : [permission];
  if (!hasAll(required))
    return <ForbiddenState requiredPermissions={required} />;
  return <>{children}</>;
}
