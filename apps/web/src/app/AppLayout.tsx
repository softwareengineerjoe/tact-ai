import { NavLink, Outlet } from 'react-router-dom';

import { Toaster } from '@/components/shared';
import { cn } from '@/utils/cn';

const NAV_ITEMS = [
  { to: '/assistant', label: 'AI Assistant' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/projects', label: 'Projects' },
  { to: '/people', label: 'People' },
  { to: '/tickets', label: 'Tickets' },
];

/** App shell: dark green sidebar + top bar + scrollable content (MASTER section 26). */
export function AppLayout() {
  return (
    <div className='flex min-h-screen'>
      <aside className='w-60 shrink-0 bg-primary-active text-primary-fg'>
        <div className='px-5 py-5 text-lg font-semibold'>TACT AI</div>
        <nav aria-label='Primary' className='flex flex-col gap-1 px-2'>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-fg'
                    : 'text-primary-fg/80 hover:bg-primary/40',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className='flex min-w-0 flex-1 flex-col'>
        <header className='flex h-14 items-center justify-end border-b border-border bg-surface px-6'>
          <span className='text-sm text-fg-muted'>Demo Manager</span>
        </header>
        <main className='flex-1 overflow-auto p-6'>
          <div className='mx-auto max-w-6xl'>
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
