import { NavLink, Outlet, useLocation } from 'react-router-dom';

import { clearActiveDemoRole } from '@/app/auth/demoRole';
import { DemoRoleSelector } from '@/app/DemoRoleSelector';
import { NAV_ITEMS } from '@/app/navigation';
import { BrandMark } from '@/components/brand/BrandLogo';
import { CommandPalette, Toaster } from '@/components/shared';
import { SparklesIcon } from '@/components/icons';
import { AssistantPanel } from '@/features/assistant';
import { TourLauncher, TourOverlay } from '@/features/tutorial';
import { useHasPermission } from '@/hooks/usePermissions';
import { useAssistantPanelStore } from '@/stores/assistantPanelStore';
import { useCommandPaletteStore } from '@/stores/commandPaletteStore';
import { cn } from '@/utils/cn';

/**
 * App shell: a compact icon rail (icon + label, no layout shift), a top bar
 * with a ⌘K command-palette trigger, and scrollable content. The rail plus
 * palette replace a traditional text sidebar for a faster, premium feel.
 */
export function AppLayout() {
  const toggleAssistant = useAssistantPanelStore((state) => state.toggle);
  const openPalette = useCommandPaletteStore((state) => state.open);
  const location = useLocation();
  const isAssistantPage = location.pathname.startsWith('/assistant');
  const hasPermission = useHasPermission();
  const navItems = NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(item.permission),
  );

  const handleLogout = () => {
    clearActiveDemoRole();
    // Full navigation resets cache + session so the landing page loads clean.
    window.location.assign('/welcome');
  };

  return (
    <div className='flex h-screen overflow-hidden'>
      <aside className='sticky top-0 flex h-screen w-20 shrink-0 flex-col items-center gap-1 bg-gradient-to-b from-primary-active to-[#0a3527] py-4 text-primary-fg'>
        <NavLink
          to='/'
          aria-label='TACT AI home'
          className='mb-3 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg/70'
        >
          <BrandMark className='h-9 w-9' />
        </NavLink>
        <nav
          aria-label='Primary'
          data-tour='nav-rail'
          className='no-scrollbar flex flex-1 flex-col items-center gap-1 overflow-y-auto'
        >
          {navItems.map((item) => {
            const NavIcon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={item.label}
                data-tour={`nav:${item.to}`}
                className={({ isActive }) =>
                  cn(
                    'group flex w-16 flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] font-medium leading-tight transition-colors',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg/70',
                    isActive
                      ? 'bg-primary/90 text-primary-fg shadow-sm'
                      : 'text-primary-fg/70 hover:bg-primary/40 hover:text-primary-fg',
                  )
                }
              >
                <NavIcon className='h-5 w-5' aria-hidden />
                <span className='text-center'>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <button
          type='button'
          onClick={handleLogout}
          title='Log out'
          className='group mt-1 flex w-16 shrink-0 flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] font-medium leading-tight text-primary-fg/70 transition-colors hover:bg-primary/40 hover:text-primary-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg/70'
        >
          <LogoutIcon className='h-5 w-5' aria-hidden />
          <span className='text-center'>Log out</span>
        </button>
      </aside>

      <div className='flex min-w-0 flex-1 flex-col'>
        <header className='sticky top-0 z-10 flex h-16 items-center gap-2 border-b border-border bg-surface/95 px-3 backdrop-blur md:gap-3 md:px-6'>
          <div className='flex min-w-0 flex-1 items-center'>
            <button
              type='button'
              onClick={openPalette}
              data-tour='command-palette'
              className='group flex h-9 min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-surface-muted/60 px-3 text-sm text-fg-muted transition-colors hover:border-primary/40 hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover sm:min-w-56 sm:max-w-md'
              aria-label='Open command palette'
            >
              <svg
                viewBox='0 0 24 24'
                className='h-4 w-4 shrink-0'
                fill='none'
                stroke='currentColor'
                strokeWidth='1.5'
                aria-hidden
              >
                <circle cx='11' cy='11' r='7' />
                <path d='m20 20-3.5-3.5' strokeLinecap='round' />
              </svg>
              <span className='flex-1 truncate text-left'>Jump to…</span>
              <kbd className='hidden rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium sm:inline-block'>
                ⌘K
              </kbd>
            </button>
          </div>

          <div className='flex shrink-0 justify-center'>
            <TourLauncher />
          </div>

          <div className='flex flex-1 items-center justify-end gap-2 md:gap-3'>
            {isAssistantPage ? null : (
              <button
                type='button'
                onClick={toggleAssistant}
                data-tour='assistant-button'
                aria-label='Ask assistant'
                className='inline-flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-sm font-medium text-fg-body transition-colors hover:border-primary/40 hover:bg-primary-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover focus-visible:ring-offset-1 sm:px-3'
              >
                <SparklesIcon className='h-4 w-4 text-primary' aria-hidden />
                <span className='hidden sm:inline'>Ask assistant</span>
              </button>
            )}
            <span data-tour='role-selector'>
              <DemoRoleSelector />
            </span>
          </div>
        </header>

        <main className='no-scrollbar flex-1 overflow-auto p-4 sm:p-6 md:p-8'>
          <div
            key={location.pathname}
            className='animate-fade-in mx-auto max-w-6xl'
          >
            <Outlet />
          </div>
        </main>
      </div>

      <AssistantPanel />
      <CommandPalette />
      <TourOverlay />
      <Toaster />
    </div>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox='0 0 24 24'
      className={className}
      fill='none'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden
    >
      <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
      <path d='m16 17 5-5-5-5' />
      <path d='M21 12H9' />
    </svg>
  );
}
