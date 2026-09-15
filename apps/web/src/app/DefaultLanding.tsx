import { Navigate } from 'react-router-dom';

import { getActiveDemoRole } from '@/app/auth/demoRole';
import { useHasPermission } from '@/hooks/usePermissions';
import type { Permission } from '@/types/permissions';

/**
 * Role-aware entry point. Sends the caller to the first destination their role
 * can actually access, so no one lands on a page they lack permission for
 * (e.g. a Team Member on the manager dashboard). Falls back to the assistant,
 * which every role with `assistant.use` can use, then to notifications, which
 * has no permission gate.
 */
const LANDING_ORDER: ReadonlyArray<{ to: string; permission?: Permission }> = [
  { to: '/dashboard', permission: 'reports.view' },
  { to: '/assistant', permission: 'assistant.use' },
  { to: '/projects', permission: 'projects.view' },
  { to: '/tickets', permission: 'tickets.view' },
  { to: '/notifications' },
];

export function DefaultLanding() {
  const hasPermission = useHasPermission();

  if (!getActiveDemoRole()) {
    return <Navigate to='/welcome' replace />;
  }

  const target =
    LANDING_ORDER.find(
      (entry) => !entry.permission || hasPermission(entry.permission),
    ) ?? LANDING_ORDER[LANDING_ORDER.length - 1];

  if (!target) {
    return <Navigate to='/welcome' replace />;
  }

  return <Navigate to={target.to} replace />;
}
