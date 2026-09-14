/**
 * Curated, static knowledge base for "Tia" on the public landing page.
 *
 * This is a deterministic, client-only guide: it answers *general* questions
 * about what TACT AI is and how to use it, and it points visitors to the demo.
 * It intentionally holds no account, project, or employee data and never calls
 * the backend — so it can never expose anything a visitor is not authorized to
 * see. Anything account- or data-specific is deferred to the in-app assistant.
 */

export interface GuideEntry {
  id: string;
  /** Short label shown as a suggested question chip. */
  question: string;
  /** Lowercase keywords used for deterministic matching. */
  keywords: readonly string[];
  /** Plain-text answer (supports line breaks via \n). */
  answer: string;
  /** When true, the UI offers a "Try the demo" call to action. */
  offersDemo?: boolean;
}

export const GUIDE_ENTRIES: readonly GuideEntry[] = [
  {
    id: 'what-is-tact',
    question: 'What is TACT AI?',
    keywords: ['what', 'tact', 'about', 'overview', 'product', 'do', 'purpose'],
    answer:
      'TACT AI (Team Assembly, Coordination, and Tracking) is an AI-assisted workspace for building and running project teams. In one place you can create a project, define the roles and skills you need, find suitable people by skills and availability, build and approve a team, track tickets and progress, and give feedback — with a built-in AI assistant to answer questions along the way.',
    offersDemo: true,
  },
  {
    id: 'get-started',
    question: 'How do I get started?',
    keywords: [
      'start',
      'begin',
      'getting',
      'started',
      'first',
      'how',
      'use',
      'try',
      'demo',
      'sign',
      'login',
      'account',
    ],
    answer:
      'No account is needed to explore. Pick one of the roles on this page to enter the demo and see TACT AI from that person\u2019s point of view. A good first path: open the Manager Dashboard, create a project, define its role requirements, then use the Team Builder to generate recommendations. You can switch roles anytime from the top bar.',
    offersDemo: true,
  },
  {
    id: 'roles',
    question: 'What roles can I try?',
    keywords: ['role', 'roles', 'persona', 'permissions', 'access', 'who'],
    answer:
      'The demo ships five roles: Organization Administrator (runs the whole workspace), Resource Manager (owns people, skills, and staffing), Project Manager (delivers projects end to end), Executive Viewer (read-only oversight), and Team Member (their own work). Each role sees only what it is permitted to \u2014 permissions are enforced by the backend, not just hidden in the UI.',
    offersDemo: true,
  },
  {
    id: 'projects',
    question: 'How do projects work?',
    keywords: ['project', 'projects', 'create', 'wizard', 'requirement', 'requirements'],
    answer:
      'A project captures its objective, priority, dates, manager, and the roles it needs. You define role requirements (headcount, required and preferred skills, allocation, dates), then move through staffing to an active project. A project can\u2019t go active without a manager, dates, at least one role requirement, and at least one confirmed team member.',
    offersDemo: true,
  },
  {
    id: 'team-builder',
    question: 'How does the Team Builder recommend people?',
    keywords: [
      'team',
      'builder',
      'recommend',
      'recommendation',
      'match',
      'fit',
      'score',
      'candidate',
      'staffing',
    ],
    answer:
      'The Team Builder compares people against a role and shows a Project Fit Score. That score is calculated deterministically from required-skill coverage, availability and capacity, relevant experience, preferred skills, and time-zone fit \u2014 the AI only explains it, it never invents it. Each recommendation shows matched skills, missing skills, remaining capacity, and any conflicts. The manager always makes the final call.',
    offersDemo: true,
  },
  {
    id: 'capacity',
    question: 'How is availability and capacity handled?',
    keywords: ['availability', 'capacity', 'workload', 'allocation', 'overallocated', 'available'],
    answer:
      'Capacity is calculated for a period as base working capacity minus approved leave, confirmed allocations, and any tentative reservations. People show as Available, Partially Available, Fully Allocated, Overallocated, or Unknown. TACT AI warns before confirming someone above capacity, and unknown availability is never treated as available.',
    offersDemo: true,
  },
  {
    id: 'tickets',
    question: 'Can I track tickets and progress?',
    keywords: ['ticket', 'tickets', 'board', 'task', 'progress', 'blocker', 'blocked', 'track'],
    answer:
      'Yes. TACT AI has a native ticket board with types, statuses, assignees, reviewers, dependencies, and blockers. Project progress and a rule-based health status (Green / Amber / Red) roll up from that work so managers can see what\u2019s on track, at risk, or blocked.',
    offersDemo: true,
  },
  {
    id: 'feedback',
    question: 'How does feedback work?',
    keywords: ['feedback', 'recognition', 'coaching', 'review', 'private'],
    answer:
      'Managers can record project-related feedback with a category and visibility (from manager-only to shared with the employee). Private feedback stays private \u2014 it never appears in general search, is access-audited, and never affects recommendation scores.',
    offersDemo: true,
  },
  {
    id: 'assistant',
    question: 'What can the in-app AI assistant do?',
    keywords: ['assistant', 'chatbot', 'chat', 'ai', 'tia', 'ask', 'questions'],
    answer:
      'Inside the app, the assistant answers questions using only the data your role is authorized to see \u2014 things like who\u2019s available for a role, why someone was recommended, which tickets are blocked, or to draft a status report. For anything that changes data, it prepares a proposal that a human approves first. Enter the demo to chat with the full assistant.',
    offersDemo: true,
  },
  {
    id: 'integrations',
    question: 'Does it integrate with other tools?',
    keywords: ['integration', 'integrations', 'jira', 'workday', 'excel', 'devops', 'teams', 'import'],
    answer:
      'TACT AI works standalone first. Integrations with tools like Excel, Jira, Workday, and Azure DevOps are optional \u2014 you can explore every core feature in the demo without connecting anything.',
    offersDemo: true,
  },
  {
    id: 'privacy',
    question: 'Is my data private and secure?',
    keywords: ['privacy', 'security', 'secure', 'safe', 'data', 'protected', 'permission'],
    answer:
      'Access is controlled by role-based permissions enforced on the backend, organizations are isolated, and sensitive fields are protected. The demo uses synthetic data only. Protected personal characteristics and private feedback are never used in recommendation scoring.',
    offersDemo: true,
  },
];

const FALLBACK_ANSWER =
  'I can help with general questions about TACT AI \u2014 what it is, how projects and teams work, tickets, feedback, capacity, and how to get started. For anything about a specific account or your own data, hop into the demo and ask the in-app assistant. Want to try it now?';

export interface GuideReply {
  answer: string;
  offersDemo: boolean;
}

/**
 * Deterministically pick the best matching entry by keyword overlap.
 * Falls back to a helpful demo nudge when nothing matches.
 */
export function answerQuestion(question: string): GuideReply {
  const tokens = question
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1);

  if (tokens.length === 0) {
    return { answer: FALLBACK_ANSWER, offersDemo: true };
  }

  const tokenSet = new Set(tokens);
  let best: GuideEntry | null = null;
  let bestScore = 0;

  for (const entry of GUIDE_ENTRIES) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (tokenSet.has(keyword)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  if (best === null || bestScore === 0) {
    return { answer: FALLBACK_ANSWER, offersDemo: true };
  }

  return { answer: best.answer, offersDemo: best.offersDemo ?? false };
}
