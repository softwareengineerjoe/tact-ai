// Demo role selector support (MASTER FR-001). Local/demo builds send the chosen
// role to the backend, which resolves the matching permission set. This is a
// demonstration aid only and is replaced by real Entra ID auth in Phase 2.

export const DEMO_ROLE_HEADER = 'X-Demo-Role';
const STORAGE_KEY = 'tact-ai.demo-role';

export interface DemoRoleOption {
  key: string;
  label: string;
}

// Keys mirror the backend catalog in security/demo_roles.py.
export const DEMO_ROLES: readonly DemoRoleOption[] = [
  { key: 'organization_admin', label: 'Organization Administrator' },
  { key: 'resource_manager', label: 'Resource Manager' },
  { key: 'project_manager', label: 'Project Manager' },
  { key: 'executive_viewer', label: 'Executive Viewer' },
  { key: 'team_member', label: 'Team Member' },
];

export const DEFAULT_DEMO_ROLE_KEY = 'organization_admin';

/** The active demo role key, or null when nothing has been selected. */
export function getActiveDemoRole(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Friendly label for a demo role key, falling back to the key itself. */
export function getDemoRoleLabel(key: string | null): string {
  return DEMO_ROLES.find((role) => role.key === key)?.label ?? 'Team Member';
}

/** Persist the active demo role. Callers refresh queries after changing it. */
export function setActiveDemoRole(key: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, key);
  } catch {
    // Ignore storage failures — the selector simply won't persist.
  }
}

/** Clear the active demo role (used by logout to return to the landing page). */
export function clearActiveDemoRole(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures — worst case the role persists until reload.
  }
}
