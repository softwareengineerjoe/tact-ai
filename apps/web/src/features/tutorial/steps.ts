import type { Permission } from '@/types/permissions';

export type StepPlacement = 'auto' | 'center' | 'right' | 'bottom';

export interface TourStep {
  id: string;
  title: string;
  body: string;
  /** Route to navigate to before showing the step (top-level, always exists). */
  route?: string;
  /** `data-tour` value of the element to spotlight. Omit for a centered card. */
  target?: string;
  placement?: StepPlacement;
  /** Only show this step when the caller holds this permission. */
  permission?: Permission;
}

/**
 * The full guided tour. Steps walk the demo through every feature and the key
 * transactions behind each one, in the natural order of the main user journey
 * (MASTER section 9). Steps are permission-filtered at runtime so each demo
 * role only sees what it can actually do.
 */
export const TOUR_STEPS: readonly TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to TACT AI 👋',
    body: "This quick tour shows how to build and run a project team end to end — projects, people, capacity, team building, tickets, feedback, reports, and the AI assistant. Use Next and Back to move through it, or Skip anytime. Let's go.",
    placement: 'center',
  },
  {
    id: 'sidebar',
    title: 'Your navigation rail',
    body: 'Everything lives here on the left. The icons only show what your current role is allowed to see — permissions are enforced by the backend, so the menu adapts to who you are.',
    route: '/notifications',
    target: 'nav-rail',
    placement: 'right',
  },
  {
    id: 'dashboard',
    title: 'Manager dashboard',
    body: 'Your command center: active projects, projects at risk, available vs. overallocated people, open and blocked tickets, staffing gaps, and pending work — all in one glance.',
    route: '/dashboard',
    target: 'nav:/dashboard',
    placement: 'right',
    permission: 'reports.view',
  },
  {
    id: 'assistant',
    title: 'Ask the AI assistant',
    body: 'Tia answers questions using only the data your role can see — “Who is available for a backend role?”, “Why was Maria recommended?”, “Which tickets are blocked?”. For anything that changes data, it prepares a proposal a human approves first.',
    route: '/assistant',
    target: 'nav:/assistant',
    placement: 'right',
    permission: 'assistant.use',
  },
  {
    id: 'assistant-panel',
    title: 'The assistant follows you',
    body: 'Ask Tia from any screen using this button — a side panel slides in so you never lose your place while you work.',
    route: '/notifications',
    target: 'assistant-button',
    placement: 'bottom',
    permission: 'assistant.use',
  },
  {
    id: 'projects',
    title: 'Projects',
    body: 'Create a project, then define its objective, dates, priority, and manager. A project moves through Draft → Staffing → Active and can’t go active without a manager, dates, a role requirement, and at least one confirmed member.',
    route: '/projects',
    target: 'nav:/projects',
    placement: 'right',
    permission: 'projects.view',
  },
  {
    id: 'create-project',
    title: 'Transaction: create a project',
    body: 'Use “New project” to launch the wizard. You’ll capture the basics, then add role requirements — headcount, required and preferred skills, allocation %, and dates for each role.',
    route: '/projects',
    target: 'nav:/projects',
    placement: 'right',
    permission: 'projects.create',
  },
  {
    id: 'team-builder',
    title: 'Transaction: build the team',
    body: 'Open a project’s Team Builder to compare candidates by Project Fit Score — a deterministic score from skill coverage, availability, experience, and time-zone fit. The AI only explains it. You then Reserve and Assign people to fill each role.',
    route: '/projects',
    target: 'nav:/projects',
    placement: 'right',
    permission: 'team.recommend',
  },
  {
    id: 'assignment-approval',
    title: 'Transaction: approve assignments',
    body: 'Assignments follow Recommended → Reserved → Pending → Confirmed. You’ll be warned before confirming anyone over capacity, and overallocation needs an explicit override reason. The manager always makes the final call.',
    route: '/projects',
    target: 'nav:/projects',
    placement: 'right',
    permission: 'team.assign',
  },
  {
    id: 'tickets',
    title: 'Tickets & progress',
    body: 'Track work on the native board across Backlog → Ready → In Progress → In Review → Done, with blockers and reviewers. Transition tickets, record blockers, and watch progress and Green/Amber/Red health roll up automatically.',
    route: '/tickets',
    target: 'nav:/tickets',
    placement: 'right',
    permission: 'tickets.view',
  },
  {
    id: 'people',
    title: 'People directory',
    body: 'Search employees by skill, proficiency, availability, and remaining capacity. Missing or stale data is flagged so you never treat “unknown” availability as free.',
    route: '/people',
    target: 'nav:/people',
    placement: 'right',
    permission: 'people.view',
  },
  {
    id: 'employee-profile',
    title: 'Profiles, capacity & feedback',
    body: 'Open a person to see their skills, current workload, assigned projects, and factual contribution info. Managers can record project feedback with a visibility setting — private feedback stays private and never affects recommendation scores.',
    route: '/people',
    target: 'nav:/people',
    placement: 'right',
    permission: 'people.view',
  },
  {
    id: 'reports',
    title: 'Reports',
    body: 'Generate a weekly status report, team composition, capacity, staffing-gap, and closure reports from a project’s Reports tab — manually or by asking the assistant.',
    route: '/projects',
    target: 'nav:/projects',
    placement: 'right',
    permission: 'reports.view',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    body: 'In-app alerts for new assignments, blocked or due tickets, review requests, capacity conflicts, and unfilled roles. Filter to unread and mark items as read as you clear them.',
    route: '/notifications',
    target: 'nav:/notifications',
    placement: 'right',
  },
  {
    id: 'imports',
    title: 'Transaction: import people',
    body: 'Bulk-load employees from a CSV. Each import runs as a job and shows exactly which rows succeeded and which need fixing before you commit.',
    route: '/imports',
    target: 'nav:/imports',
    placement: 'right',
    permission: 'people.edit',
  },
  {
    id: 'command-palette',
    title: 'Jump anywhere fast',
    body: 'Press ⌘K (or click here) to open the command palette and jump to any screen instantly — great once you know your way around.',
    target: 'command-palette',
    placement: 'bottom',
  },
  {
    id: 'roles',
    title: 'Roles & access model',
    body: 'This reference shows how permissions map to roles. The whole app — menus, actions, and even individual fields — respects these rules on the backend.',
    route: '/admin/roles',
    target: 'nav:/admin/roles',
    placement: 'right',
    permission: 'roles.manage',
  },
  {
    id: 'role-selector',
    title: 'Switch personas',
    body: 'Change the demo role here to instantly see the app from another point of view — watch the menu, actions, and data access change to match that role’s permissions.',
    target: 'role-selector',
    placement: 'bottom',
  },
  {
    id: 'finish',
    title: 'You’re ready 🎉',
    body: 'That’s the full workflow: create a project, define needs, build and approve a team, run tickets, give feedback, report, and ask the assistant. Explore freely — you can relaunch this tour anytime from “Take a tour” in the top bar.',
    placement: 'center',
  },
];

/**
 * Per-role framing for the tour's welcome step. Each entry is a short summary of
 * what that role can actually do, so the visitor immediately understands the
 * persona they're exploring. Keyed by the demo role key in demoRole.ts; falls
 * back to `default` for any unknown role.
 */
export const ROLE_TOUR_INTROS: Record<string, string> = {
  organization_admin:
    'you have the widest access: manage the organization, users, roles, and integrations, and oversee every project, person, ticket, and report. This tour walks the full end-to-end workflow — notice this is the only role that sees everything.',
  resource_manager:
    'you own the people side: maintain the employee directory, skills, and availability, then staff projects and resolve capacity conflicts. You build and approve teams and import people — but you won’t manage the ticket board or edit project scope. Watch how the tour focuses on discovery, capacity, and staffing.',
  project_manager:
    'you run projects end to end: define role requirements, build and approve the team, assign and track tickets, record feedback, and generate reports. Unlike a Resource Manager, you own the ticket board and reporting — but you don’t bulk-import people. The tour follows that project-owner journey.',
  executive_viewer:
    'you get a read-only overview: project health, capacity summaries, staffing progress, and reports across the portfolio. You can’t create projects, staff teams, or manage tickets — so this tour is short and focused on the dashboards and insights you can explore.',
  team_member:
    'you focus on your own work: your assigned projects and tickets, your availability, and the feedback shared with you. You won’t see staffing, the people directory, or private feedback — so this tour highlights just your workspace and the AI assistant.',
  default:
    "here's how TACT AI helps you build and run a project team end to end — the tour only shows the features your role can actually use.",
};

/**
 * Build the role-aware welcome step. It opens with "As a {role}, ..." so the
 * visitor always knows which persona they're currently exploring.
 */
export function buildWelcomeStep(roleKey: string | null, roleLabel: string): TourStep {
  const summary = ROLE_TOUR_INTROS[roleKey ?? 'default'] ?? ROLE_TOUR_INTROS.default;
  return {
    id: 'welcome',
    title: `Welcome, ${roleLabel} 👋`,
    body: `As a ${roleLabel}, ${summary} Use Next and Back to move through it, or Skip anytime.`,
    placement: 'center',
  };
}

/** Build the role-aware closing step, reminding the visitor of their persona. */
export function buildFinishStep(roleLabel: string): TourStep {
  return {
    id: 'finish',
    title: 'You’re ready 🎉',
    body: `That’s the workflow available to you as a ${roleLabel}. Explore freely — switch personas anytime with the role selector, or relaunch this tour from “Take a tour” in the top bar.`,
    placement: 'center',
  };
}
