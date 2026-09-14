import {
  DEFAULT_DEMO_ROLE_KEY,
  DEMO_ROLES,
  getActiveDemoRole,
  setActiveDemoRole,
} from '@/app/auth/demoRole';

/**
 * Demo-only role switcher (MASTER FR-001). Selecting a role re-loads the app so
 * every query — including the session — refetches with the new role's
 * permissions, letting RBAC differences (nav, gated actions, field access) show
 * live. Replaced by real Entra ID sign-in in Phase 2.
 */
export function DemoRoleSelector() {
  const active = getActiveDemoRole() ?? DEFAULT_DEMO_ROLE_KEY;

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveDemoRole(event.target.value);
    // Full reload guarantees a clean cache + session refetch for the demo.
    window.location.reload();
  };

  return (
    <label className='flex items-center gap-2 text-sm text-fg-muted'>
      <span className='hidden sm:inline'>Demo role</span>
      <select
        value={active}
        onChange={handleChange}
        className='rounded-md border border-border bg-surface px-2 py-1 text-sm font-medium text-fg-body focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover focus-visible:ring-offset-1'
      >
        {DEMO_ROLES.map((role) => (
          <option key={role.key} value={role.key}>
            {role.label}
          </option>
        ))}
      </select>
    </label>
  );
}
