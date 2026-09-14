import { PageHeader } from '@/components/shared';
import { ShieldIcon } from '@/components/icons';

/**
 * Read-only reference explaining each role, its purpose, and what it can do.
 * Content mirrors the demo role catalog (backend security/demo_roles.py) so
 * teams can see, at a glance, how responsibilities differ — and judge whether
 * the role set is too complex for a simple app. Static by design: role and
 * permission definitions are configuration, so no data fetching is needed.
 */

interface RoleInfo {
  name: string;
  audience: string;
  summary: string;
  canDo: readonly string[];
  cannotDo: readonly string[];
}

const ROLES: readonly RoleInfo[] = [
  {
    name: 'Organization Administrator',
    audience: 'IT / platform owner',
    summary:
      'Runs the whole workspace. Has full access for setup, demos, and support.',
    canDo: [
      'Everything every other role can do',
      'Manage users, roles, and integrations',
      'View audit logs and organization settings',
    ],
    cannotDo: ['Nothing is restricted (full access)'],
  },
  {
    name: 'Resource Manager',
    audience: 'Staffing / resourcing lead',
    summary:
      'Owns people: their skills, availability, and how they get staffed onto projects.',
    canDo: [
      'Manage the employee directory, skills, and availability',
      'Recommend, assign, and remove people from teams',
      'Override capacity when staffing a project',
      'View projects and reports; use the AI assistant',
    ],
    cannotDo: [
      'Create or edit projects',
      'Manage tickets or feedback',
      'Manage users, roles, or integrations',
    ],
  },
  {
    name: 'Project Manager',
    audience: 'Person delivering a project',
    summary:
      'Owns their projects end to end: the plan, the team, the tickets, and the feedback.',
    canDo: [
      'Create, edit, archive, and close projects',
      'Build teams (recommend / assign / remove)',
      'Manage tickets and give feedback (incl. private)',
      'Generate reports; approve AI action proposals',
    ],
    cannotDo: [
      'Edit the employee directory or skills',
      'Override capacity limits',
      'Manage users, roles, or integrations',
    ],
  },
  {
    name: 'Executive Viewer',
    audience: 'Leadership / stakeholders',
    summary:
      'Sees the big picture without touching anything. Read-only oversight.',
    canDo: [
      'View projects and reports',
      'See workload summaries; use the AI assistant',
    ],
    cannotDo: [
      'Create or change anything',
      'View private feedback',
      'Manage people, tickets, users, or settings',
    ],
  },
  {
    name: 'Team Member',
    audience: 'People doing the work',
    summary:
      'Focuses on their own work: assigned projects, tickets, and feedback shared with them.',
    canDo: [
      'View projects and their assigned tickets',
      'View and acknowledge feedback shared with them',
      'Use the AI assistant',
    ],
    cannotDo: [
      'Manage projects, teams, or tickets',
      'View private feedback',
      'Manage people, users, or settings',
    ],
  },
];

function RoleCard({ role }: { role: RoleInfo }) {
  return (
    <article className='rounded-lg border border-border bg-surface p-6 shadow-xs'>
      <div className='flex flex-wrap items-baseline justify-between gap-2'>
        <h2 className='text-lg font-semibold text-fg'>{role.name}</h2>
        <span className='rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-fg-muted'>
          {role.audience}
        </span>
      </div>
      <p className='mt-2 text-sm text-fg-body'>{role.summary}</p>
      <div className='mt-4 grid gap-4 sm:grid-cols-2'>
        <div>
          <h3 className='text-xs font-semibold uppercase tracking-wide text-success'>
            Can do
          </h3>
          <ul className='mt-2 space-y-1 text-sm text-fg-body'>
            {role.canDo.map((item) => (
              <li key={item} className='flex gap-2'>
                <span aria-hidden className='text-success'>
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className='text-xs font-semibold uppercase tracking-wide text-fg-muted'>
            Cannot do
          </h3>
          <ul className='mt-2 space-y-1 text-sm text-fg-muted'>
            {role.cannotDo.map((item) => (
              <li key={item} className='flex gap-2'>
                <span aria-hidden>—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

export function RolesReferencePage() {
  return (
    <main aria-labelledby='roles-title'>
      <PageHeader
        id='roles-title'
        eyebrow='Access model'
        icon={<ShieldIcon className='h-5 w-5' />}
        title='Roles & what they can do'
        description='The five roles used in TACT AI, from most to least access. Use this to decide who needs which access — and whether the set can be simpler.'
      />
      <div className='space-y-4'>
        {ROLES.map((role) => (
          <RoleCard key={role.name} role={role} />
        ))}
      </div>
      <aside className='mt-8 rounded-lg border border-border bg-surface-muted p-5 text-sm text-fg-body'>
        <h2 className='text-sm font-semibold text-fg'>How access is decided</h2>
        <p className='mt-2'>
          Each role is just a bundle of fine-grained permissions (for example
          &ldquo;create projects&rdquo; or &ldquo;view private feedback&rdquo;).
          The backend always enforces them, and the AI assistant can never do
          more than the person using it.
        </p>
      </aside>
    </main>
  );
}
