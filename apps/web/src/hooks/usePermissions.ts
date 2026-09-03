import { useSession } from '@/app/auth/useSession';
import type { Permission } from '@/types/permissions';

export function useHasPermission(): (permission: Permission) => boolean {
  const { permissions } = useSession();
  const granted = new Set(permissions);
  return (permission) => granted.has(permission);
}

export function useHasAnyPermission(): (perms: readonly Permission[]) => boolean {
  const has = useHasPermission();
  return (perms) => perms.some(has);
}

export function useHasAllPermissions(): (perms: readonly Permission[]) => boolean {
  const has = useHasPermission();
  return (perms) => perms.every(has);
}
