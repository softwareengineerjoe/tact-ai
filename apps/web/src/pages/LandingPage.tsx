import { BrandLogo } from '@/components/brand/BrandLogo';
import {
  DashboardIcon,
  PeopleIcon,
  ProjectsIcon,
  ShieldIcon,
  SparklesIcon,
} from '@/components/icons';
import { DEMO_ROLES, setActiveDemoRole } from '@/app/auth/demoRole';
import { LandingGuide } from '@/features/landing-guide';
import type { ReactNode } from 'react';

interface RolePitch {
  key: string;
  tagline: string;
  blurb: string;
  icon: ReactNode;
}

// Ordered most → least access; mirrors the demo role catalog.
const ROLE_PITCH: Record<string, Omit<RolePitch, 'key'>> = {
  organization_admin: {
    tagline: 'Run the whole workspace',
    blurb: 'Full access — users, roles, integrations, and every project.',
    icon: <ShieldIcon className='h-5 w-5' />,
  },
  resource_manager: {
    tagline: 'Own people & staffing',
    blurb: 'Manage skills, availability, capacity, and team assignments.',
    icon: <PeopleIcon className='h-5 w-5' />,
  },
  project_manager: {
    tagline: 'Deliver projects end to end',
    blurb: 'Build teams, run tickets, give feedback, approve AI actions.',
    icon: <ProjectsIcon className='h-5 w-5' />,
  },
  executive_viewer: {
    tagline: 'See the big picture',
    blurb: 'Read-only oversight across projects, reports, and capacity.',
    icon: <DashboardIcon className='h-5 w-5' />,
  },
  team_member: {
    tagline: 'Focus on your work',
    blurb: 'Your assigned projects, tickets, and shared feedback.',
    icon: <SparklesIcon className='h-5 w-5' />,
  },
};

/**
 * Standalone landing / role-picker shown before entering the app (FR-001 demo
 * role selector). Choosing a role stores it and reloads so the session and
 * every query resolve with that role's permissions.
 */
export function LandingPage() {
  const choose = (key: string) => {
    setActiveDemoRole(key);
    window.location.assign('/dashboard');
  };

  return (
    <main className='relative min-h-screen overflow-hidden bg-gradient-to-br from-primary-active via-[#0c4030] to-[#08301f] text-primary-fg'>
      {/* ambient depth */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 opacity-60'
        style={{
          backgroundImage:
            'radial-gradient(40rem 40rem at 85% -5%, rgba(63,165,123,0.25), transparent 60%), radial-gradient(35rem 35rem at -5% 110%, rgba(198,161,91,0.12), transparent 55%)',
        }}
      />
      {/* Slow-drifting ambient orbs add depth without distraction. */}
      <div
        aria-hidden
        className='animate-drift pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-[#3fa57b]/20 blur-3xl'
      />
      <div
        aria-hidden
        className='animate-float pointer-events-none absolute -left-16 bottom-16 h-64 w-64 rounded-full bg-accent-gold/10 blur-3xl'
      />

      <div className='relative mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10'>
        <header className='animate-fade-in flex items-center justify-between'>
          <BrandLogo variant='light' />
          <span className='inline-flex items-center gap-1.5 rounded-full border border-primary-fg/20 bg-primary-fg/5 px-3 py-1 text-xs font-medium text-primary-fg/80'>
            <span
              aria-hidden
              className='h-1.5 w-1.5 rounded-full bg-[#3fa57b] shadow-[0_0_0_3px_rgba(63,165,123,0.25)]'
            />
            Demo environment
          </span>
        </header>

        <section className='mx-auto mt-16 max-w-2xl text-center'>
          <p className='animate-rise-in text-xs font-semibold uppercase tracking-[0.2em] text-primary-fg/60'>
            Team Assembly · Coordination · Tracking
          </p>
          <h1
            className='animate-rise-in mt-4 text-4xl font-semibold tracking-tight sm:text-5xl'
            style={{ animationDelay: '0.08s' }}
          >
            Build the right team for every project.
          </h1>
          <p
            className='animate-rise-in mx-auto mt-4 max-w-xl text-base text-primary-fg/75'
            style={{ animationDelay: '0.16s' }}
          >
            One intelligent workspace for projects, people, capacity, tickets,
            and feedback. Choose a role below to explore TACT AI from their
            point of view.
          </p>
        </section>

        <section aria-labelledby='choose-role' className='mt-14 flex-1'>
          <h2
            id='choose-role'
            className='animate-fade-in mb-4 text-center text-sm font-medium text-primary-fg/70'
            style={{ animationDelay: '0.24s' }}
          >
            Continue as…
          </h2>
          <div className='stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {DEMO_ROLES.map((role) => {
              const pitch = ROLE_PITCH[role.key];
              if (!pitch) return null;
              return (
                <button
                  key={role.key}
                  type='button'
                  onClick={() => choose(role.key)}
                  className='group relative flex flex-col gap-3 overflow-hidden rounded-lg border border-primary-fg/15 bg-primary-fg/[0.06] p-5 text-left backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:border-primary-fg/40 hover:bg-primary-fg/10 hover:shadow-lg hover:shadow-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg/70'
                >
                  {/* Sheen sweep on hover. */}
                  <span
                    aria-hidden
                    className='pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary-fg/10 to-transparent transition-transform duration-700 group-hover:translate-x-full'
                  />
                  <span className='flex h-10 w-10 items-center justify-center rounded-md bg-primary-fg/10 text-primary-fg transition-transform duration-200 group-hover:scale-110 group-hover:bg-primary-fg/20'>
                    {pitch.icon}
                  </span>
                  <span>
                    <span className='block text-base font-semibold text-primary-fg'>
                      {role.label}
                    </span>
                    <span className='block text-sm font-medium text-primary-fg/80'>
                      {pitch.tagline}
                    </span>
                  </span>
                  <span className='text-sm text-primary-fg/65'>
                    {pitch.blurb}
                  </span>
                  <span className='mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary-fg/90'>
                    Enter as {role.label.split(' ')[0]}
                    <span
                      aria-hidden
                      className='transition-transform duration-200 group-hover:translate-x-1'
                    >
                      →
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <footer className='animate-fade-in mt-12 text-center text-xs text-primary-fg/50'>
          You can switch roles anytime from the top bar. Permissions are
          enforced by the backend — the assistant never exceeds your access.
        </footer>
      </div>

      {/* Public companion: answers general questions and leads to the demo. */}
      <LandingGuide onTryDemo={() => choose('project_manager')} />
    </main>
  );
}
