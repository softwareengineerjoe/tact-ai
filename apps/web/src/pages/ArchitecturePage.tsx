import { PageHeader } from '@/components/shared';
import { CompassIcon } from '@/components/icons';

/**
 * Static reference that shows the MVP architecture as a top-down diagram: the
 * React client talks to a layered FastAPI backend, which owns PostgreSQL, the
 * read-only AI orchestrator, and optional provider adapters. A second section
 * lists the optional integrations that can be configured per feature.
 *
 * Static by design — this is documentation, so there is no data fetching.
 */

interface Node {
  title: string;
  tech: string;
  description: string;
}

const CLIENT: Node = {
  title: 'Web Client',
  tech: 'React 19 · TypeScript · Vite · Tailwind · TanStack Query',
  description:
    'Single-page app. Server state via TanStack Query, UI state via Zustand, forms validated with Zod.',
};

const API: Node = {
  title: 'FastAPI Backend',
  tech: 'Python 3.14 · FastAPI · Pydantic v2 · REST + SSE',
  description:
    'One entry point. Routers only map requests; all rules live below. Enforces auth and org scope.',
};

const SERVICE_LAYERS: readonly Node[] = [
  {
    title: 'Services',
    tech: 'Domain logic',
    description: 'Business rules, deterministic scoring, permission checks.',
  },
  {
    title: 'Repositories',
    tech: 'SQLAlchemy 2',
    description: 'All DB access, always scoped by organization.',
  },
  {
    title: 'Security',
    tech: 'RBAC',
    description: 'Permissions, field-level access, and audit.',
  },
];

const PLATFORM: readonly Node[] = [
  {
    title: 'PostgreSQL',
    tech: 'Data of record',
    description:
      'Projects, people, tickets, feedback, audit, and the AI transcript. Soft-deleted, versioned.',
  },
  {
    title: 'AI Orchestrator',
    tech: 'Foundry · deterministic fallback',
    description:
      'Read-only agent behind secured tools. Inherits the caller’s permissions, never touches the DB, and falls back to a local deterministic provider offline.',
  },
  {
    title: 'Integration Adapters',
    tech: 'Optional · pluggable',
    description:
      'Provider adapters behind an interface so core features never depend on any external system. CSV/XLSX import ships in the MVP; others are planned.',
  },
];

interface FeatureIntegration {
  feature: string;
  providers: string;
  note: string;
  /** Whether the adapter is built in the current MVP or planned for a later phase. */
  status: 'MVP' | 'Planned';
}

const INTEGRATIONS: readonly FeatureIntegration[] = [
  {
    feature: 'Employee directory & skills',
    providers: 'Excel/CSV · Workday',
    note: 'CSV/XLSX import today; read-only Workday sync of profiles and skills later.',
    status: 'MVP',
  },
  {
    feature: 'Availability & capacity',
    providers: 'Excel · Workday · Calendar',
    note: 'External leave/availability becomes an input to capacity.',
    status: 'Planned',
  },
  {
    feature: 'Tickets',
    providers: 'Jira · Azure DevOps',
    note: 'Each project picks one owner; that system stays canonical.',
    status: 'Planned',
  },
  {
    feature: 'Documents & knowledge',
    providers: 'SharePoint · Blob Storage',
    note: 'Indexed for AI retrieval while preserving source permissions.',
    status: 'Planned',
  },
  {
    feature: 'Development activity',
    providers: 'GitHub · Azure DevOps',
    note: 'Read-only links from tickets to branches, PRs, and builds.',
    status: 'Planned',
  },
  {
    feature: 'Notifications',
    providers: 'Microsoft Teams · Slack',
    note: 'Optional outbound alerts; in-app notifications work standalone today.',
    status: 'Planned',
  },
];

interface DeploymentRow {
  layer: string;
  hosting: string;
  detail: string;
}

/** How the MVP is actually deployed today (see scripts/deploy-azure.ps1). */
const DEPLOYMENT: readonly DeploymentRow[] = [
  {
    layer: 'Web client',
    hosting: 'Azure Static Web Apps (Free)',
    detail: 'Vite build deployed via the SWA CLI · region East Asia.',
  },
  {
    layer: 'Backend API',
    hosting: 'Azure Container Apps',
    detail:
      'Container image built in ACR (no local Docker) · region Southeast Asia.',
  },
  {
    layer: 'Database',
    hosting: 'PostgreSQL 17 Flexible Server',
    detail:
      'Azure Database for PostgreSQL · managed, in the same resource group.',
  },
  {
    layer: 'AI model',
    hosting: 'Microsoft Foundry (gpt-4.1)',
    detail:
      'Existing Foundry account; endpoint + key passed as Container App secrets.',
  },
  {
    layer: 'Registry & logs',
    hosting: 'ACR · Log Analytics',
    detail:
      'Container Registry for images; Log Analytics workspace for diagnostics.',
  },
  {
    layer: 'CI/CD',
    hosting: 'GitHub Actions',
    detail:
      'Push to main auto-deploys: backend via ACR build + Container App revision, frontend to SWA. Azure sign-in uses OIDC (a managed identity), so no client secret is stored.',
  },
];

/** A single box in the diagram. */
function DiagramCard({
  node,
  accent = false,
}: {
  node: Node;
  accent?: boolean;
}) {
  return (
    <div
      className={
        accent
          ? 'rounded-lg border border-primary/30 bg-primary-subtle p-4 shadow-xs'
          : 'rounded-lg border border-border bg-surface p-4 shadow-xs'
      }
    >
      <div className='flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1'>
        <h3 className='text-sm font-semibold text-fg'>{node.title}</h3>
        <span className='text-[11px] font-medium text-primary'>
          {node.tech}
        </span>
      </div>
      <p className='mt-1.5 text-xs leading-relaxed text-fg-muted'>
        {node.description}
      </p>
    </div>
  );
}

/** Vertical connector with a downward arrow between diagram layers. */
function Connector({ label }: { label: string }) {
  return (
    <div className='flex flex-col items-center py-1' aria-hidden>
      <span className='text-[10px] font-medium uppercase tracking-wide text-fg-muted'>
        {label}
      </span>
      <span className='mt-0.5 text-fg-muted'>↓</span>
    </div>
  );
}

export function ArchitecturePage() {
  return (
    <main aria-labelledby='architecture-title'>
      <PageHeader
        id='architecture-title'
        eyebrow='System design'
        icon={<CompassIcon className='h-5 w-5' />}
        title='MVP architecture'
        description='TACT AI helps managers build and run project teams — staffing, capacity, tickets, and feedback in one place. It runs standalone as a React + FastAPI app with a read-only AI layer, and adds optional, per-feature integrations as it grows.'
      />

      {/* Top-down architecture diagram */}
      <section aria-label='Architecture diagram' className='mx-auto max-w-3xl'>
        <DiagramCard node={CLIENT} accent />
        <Connector label='HTTPS · REST · SSE' />
        <DiagramCard node={API} accent />

        <Connector label='one direction' />
        <div className='grid gap-3 sm:grid-cols-3'>
          {SERVICE_LAYERS.map((node) => (
            <DiagramCard key={node.title} node={node} />
          ))}
        </div>

        <Connector label='reads & writes' />
        <div className='grid gap-3 sm:grid-cols-3'>
          {PLATFORM.map((node) => (
            <DiagramCard key={node.title} node={node} />
          ))}
        </div>
      </section>

      {/* Optional per-feature integrations */}
      <section aria-labelledby='integrations-title' className='mt-10'>
        <h2 id='integrations-title' className='text-lg font-semibold text-fg'>
          Optional integrations
        </h2>
        <p className='mt-1 text-sm text-fg-muted'>
          Every core feature works standalone. These providers can be configured
          per feature — CSV/XLSX import ships in the MVP; the rest are planned.
        </p>
        <div className='mt-4 overflow-x-auto rounded-lg border border-border bg-surface shadow-xs'>
          <table className='w-full min-w-[36rem] text-left text-sm'>
            <thead>
              <tr className='border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-fg-muted'>
                <th className='px-4 py-2.5 font-semibold'>Feature</th>
                <th className='px-4 py-2.5 font-semibold'>
                  Providers (optional)
                </th>
                <th className='px-4 py-2.5 font-semibold'>How it connects</th>
                <th className='px-4 py-2.5 font-semibold'>Status</th>
              </tr>
            </thead>
            <tbody>
              {INTEGRATIONS.map((row) => (
                <tr
                  key={row.feature}
                  className='border-b border-border/70 last:border-0'
                >
                  <td className='px-4 py-3 font-medium text-fg-body'>
                    {row.feature}
                  </td>
                  <td className='px-4 py-3 text-primary'>{row.providers}</td>
                  <td className='px-4 py-3 text-fg-muted'>{row.note}</td>
                  <td className='px-4 py-3'>
                    <span
                      className={
                        row.status === 'MVP'
                          ? 'inline-flex items-center rounded-full bg-primary-subtle px-2 py-0.5 text-xs font-medium text-primary'
                          : 'inline-flex items-center rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-fg-muted'
                      }
                    >
                      {row.status === 'MVP' ? 'MVP now' : 'Planned'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* How it's deployed today — transparency */}
      <section aria-labelledby='deployment-title' className='mt-10'>
        <h2 id='deployment-title' className='text-lg font-semibold text-fg'>
          How it’s deployed today
        </h2>
        <p className='mt-1 text-sm text-fg-muted'>
          The current Phase&nbsp;1 dev environment runs on Azure, first
          provisioned by a CLI-first script (
          <code className='rounded bg-surface-muted px-1 py-0.5 text-xs'>
            scripts/deploy-azure.ps1
          </code>
          ) and now redeployed automatically by GitHub Actions on every push to{' '}
          <code className='rounded bg-surface-muted px-1 py-0.5 text-xs'>
            main
          </code>
          . Everything lives in one resource group.
        </p>
        <div className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {DEPLOYMENT.map((row) => (
            <div
              key={row.layer}
              className='rounded-lg border border-border bg-surface p-4 shadow-xs'
            >
              <h3 className='text-sm font-semibold text-fg'>{row.layer}</h3>
              <p className='mt-0.5 text-[11px] font-medium text-primary'>
                {row.hosting}
              </p>
              <p className='mt-1.5 text-xs leading-relaxed text-fg-muted'>
                {row.detail}
              </p>
            </div>
          ))}
        </div>
        <p className='mt-3 text-xs text-fg-muted'>
          Secrets are passed as Container App secrets, never committed. A GitHub
          Actions pipeline handles deploys today; Bicep infrastructure-as-code
          is planned for later phases.
        </p>
      </section>
    </main>
  );
}
