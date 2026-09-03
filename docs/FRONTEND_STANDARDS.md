# Frontend Coding Standards

**Status:** Binding standard. Derived from [MASTER.md](MASTER.md) (sections 18.1, 19, 22, 23, 28, 29).

The single source of truth is [MASTER.md](MASTER.md). This document defines the
**mandatory** structure, naming, and patterns for the React web application in
[apps/web](../apps/web). Every component, page, hook, store, service, and route
MUST follow these rules. When anything here conflicts with the master, the
master wins unless an approved ADR changes it.

---

## 0. Simplicity First (read before everything else)

The highest priority is **clean, simple, maintainable code**. Prefer the smallest
solution that satisfies the requirement and the standards below. When two
approaches both comply, **choose the one with less code and fewer moving parts.**

Mandatory mindset:

1. **Solve the problem in front of you** — build for today's requirement, not an
   imagined future one (YAGNI). Do not add options, props, config, or layers
   "just in case."
2. **Less code wins.** Fewer components, fewer abstractions, fewer dependencies.
   Delete code before adding it; reuse an existing primitive before writing a new one.
3. **No premature abstraction.** Duplicate twice before extracting a shared
   helper/hook/component on the third use. A little duplication is cheaper than
   the wrong abstraction.
4. **Readable over clever.** Write obvious code a new teammate understands at a
   glance. Avoid dense one-liners, deep generics, and clever type gymnastics.
5. **Shallow over deep.** Avoid needless wrapper components, indirection, and
   prop-drilling layers. Keep the component tree and data flow flat and traceable.
6. **Boring by default.** Use the plainest React/TypeScript pattern that works;
   reach for advanced patterns (render props, context, HOCs, custom generics)
   only when a concrete, present need proves them necessary.
7. **Match the templates, don't gold-plate them.** The templates in this document
   are the ceiling of complexity for common cases, not a floor to build on.

A change that adds abstraction, indirection, or configuration must justify its
complexity in the PR. If it cannot, simplify it. "It might be useful later" is
not a justification.

---

## 1. Non-Negotiable Rules

1. TypeScript **strict mode** stays enabled. No `any`. Use `unknown` + narrowing.
2. **TanStack Query owns server state.** Never duplicate API records into Zustand.
3. **Zustand only holds cross-page UI state** (theme, sidebar, active org, modal stacks).
4. Every page renders **loading, empty, error, and success** states explicitly.
5. **No business logic inside components/pages.** Put it in hooks, services, or utils.
6. All network access goes through the typed **API client**, never raw `fetch` in components.
7. All external input/output is validated with **Zod** at the boundary.
8. Components are **presentational or container**, never both.
9. Accessibility (WCAG 2.2 AA) is a requirement, not an option. No color-only status.
10. No default exports for components, hooks, or services. **Named exports only.**

---

## 2. Folder Structure

Aligned with MASTER section 19. `apps/web/src`:

```text
src/
├── app/            # App shell: providers, router, layout, error boundaries
├── components/     # Reusable, presentational, domain-agnostic UI
│   ├── ui/         # shadcn/ui primitives (button, dialog, input, ...)
│   └── shared/     # Cross-app shared components incl. states/ (see 13A):
│                   #   LoadingState, EmptyState, ErrorState, ForbiddenState,
│                   #   OfflineState, PartialDataNotice, QueryBoundary,
│                   #   ConfirmDialog, PermissionGate, toast, PageHeader
├── features/       # Domain modules (projects, people, tickets, feedback, assistant, ...)
├── pages/          # Route-level components; compose features; own page states
├── services/       # API client + per-domain service modules (HTTP calls only)
├── hooks/          # Cross-cutting hooks (not tied to one feature)
├── stores/         # Zustand stores (UI state only)
├── types/          # Shared TypeScript types + Zod schemas
└── utils/          # Pure helper functions (no React, no I/O)
```

### Feature module layout (the default place for domain code)

Each domain lives under `features/<domain>/` and is self-contained:

```text
features/projects/
├── api/            # TanStack Query hooks (useProjects, useCreateProject, ...)
├── components/     # Feature-specific presentational components
├── containers/     # Feature-specific container components (data + logic)
├── schemas/        # Zod schemas for this feature
├── types.ts        # Types derived from schemas + view models
├── utils.ts        # Pure feature helpers
└── index.ts        # Public surface (barrel) — only export what pages need
```

Rule: **Pages import from a feature's `index.ts`, never reach into internals.**

---

## 3. Naming Conventions

| Artifact                  | Case            | Example                          |
| ------------------------- | --------------- | -------------------------------- |
| Component file & symbol   | PascalCase      | `ProjectCard.tsx` / `ProjectCard`|
| Page file & symbol        | PascalCase+`Page`| `ProjectListPage.tsx`           |
| Hook file & symbol        | camelCase `use` | `useProjectTeam.ts` / `useProjectTeam` |
| Query hook                | `use<Entity>` / `use<Action>` | `useProjects`, `useCreateProject` |
| Store file & symbol       | camelCase `Store` | `uiStore.ts` / `useUiStore`    |
| Service file              | camelCase       | `projectsService.ts`             |
| Zod schema                | PascalCase `Schema` | `ProjectSchema`              |
| Inferred type             | PascalCase      | `type Project = z.infer<...>`    |
| Type / interface          | PascalCase      | `ProjectFormValues`              |
| Constant                  | UPPER_SNAKE     | `MAX_TEAM_SIZE`                  |
| Boolean prop/var          | `is/has/can/should` | `isLoading`, `canEdit`       |
| Event handler             | `handle<Event>` | `handleSubmit`                   |
| Handler prop              | `on<Event>`     | `onSelect`                       |
| CSS/test id               | kebab-case      | `data-testid="project-card"`     |

Folders are kebab-case except feature/domain names which are singular-or-plural
domain nouns (`projects`, `people`, `team-builder`).

---

## 4. Import Order (enforced by ESLint)

```text
1. React / third-party libraries
2. Absolute app imports (@/app, @/components, @/features, ...)
3. Relative imports (./ and ../)
4. Type-only imports (import type ...)
5. Styles / assets
```

Always use the `@/` path alias for cross-module imports. Use relative imports
only within the same feature folder.

---

## 5. Component Standard

### 5.1 Presentational component template

```tsx
// features/projects/components/ProjectCard.tsx
import { cn } from '@/utils/cn';
import type { Project } from '@/features/projects';

interface ProjectCardProps {
  project: Project;
  isSelected?: boolean;
  onSelect?: (projectId: string) => void;
  className?: string;
}

/**
 * Presentational card for a single project.
 * Pure: no data fetching, no store access, no side effects.
 */
export function ProjectCard({
  project,
  isSelected = false,
  onSelect,
  className,
}: ProjectCardProps) {
  return (
    <article
      className={cn('rounded-lg border p-4', isSelected && 'ring-2', className)}
      aria-current={isSelected ? 'true' : undefined}
    >
      <h3 className="font-medium">{project.name}</h3>
      <p className="text-sm text-muted-foreground">{project.status}</p>
      {onSelect ? (
        <button type="button" onClick={() => onSelect(project.id)}>
          Select
        </button>
      ) : null}
    </article>
  );
}
```

Rules:

* Props interface named `<Component>Props`, defined directly above the component.
* Destructure props in the signature; give optional props defaults there.
* Always accept an optional `className` for composability; merge with `cn`.
* Presentational components receive data and callbacks only — no hooks that fetch.
* One component per file. Small private sub-components may live in the same file.

### 5.2 Container component template

```tsx
// features/projects/containers/ProjectListContainer.tsx
import { useProjects } from '@/features/projects';
import { ProjectCard } from '@/features/projects';
import { EmptyState, ErrorState, LoadingState } from '@/components/shared';

interface ProjectListContainerProps {
  organizationId: string;
}

export function ProjectListContainer({ organizationId }: ProjectListContainerProps) {
  const { data, isPending, isError, error, refetch } = useProjects({ organizationId });

  if (isPending) return <LoadingState label="Loading projects" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (data.items.length === 0) return <EmptyState title="No projects yet" />;

  return (
    <ul className="grid gap-3">
      {data.items.map((project) => (
        <li key={project.id}>
          <ProjectCard project={project} />
        </li>
      ))}
    </ul>
  );
}
```

Containers own data + wiring; they render presentational components and the
four required states. They contain no JSX-heavy layout beyond composition.

---

## 6. Page Standard

Pages live in `src/pages`, are named `<Name>Page`, and map 1:1 to routes in
MASTER section 24. A page:

* Reads route params, sets page title / breadcrumbs.
* Composes containers and layout.
* Must render all four states (delegated to containers is fine).
* Contains **no** direct API calls or business logic.

```tsx
// pages/projects/ProjectListPage.tsx
import { PageHeader } from '@/components/shared';
import { ProjectListContainer } from '@/features/projects';
import { useActiveOrganization } from '@/stores/uiStore';

export function ProjectListPage() {
  const organizationId = useActiveOrganization();

  return (
    <main aria-labelledby="projects-title">
      <PageHeader id="projects-title" title="Projects" />
      <ProjectListContainer organizationId={organizationId} />
    </main>
  );
}
```

Required state checklist for every page (MASTER section 25):

```text
[ ] Authorized roles enforced (route guard + backend)
[ ] Loading state
[ ] Empty state
[ ] Error state (with retry where sensible)
[ ] Success state
[ ] Keyboard + screen-reader accessible
[ ] Responsive
```

---

## 7. Routing Standard

* Routes are declared centrally in `app/router.tsx` and match MASTER section 24 exactly.
* Every protected route is wrapped in a `<RequireAuth>` + `<RequirePermission>` guard.
* Guards are UI convenience only — the backend remains the real authority (MASTER section 28).
* Lazy-load page modules with `React.lazy` + `Suspense` boundary per route group.

```tsx
// app/router.tsx
import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RequireAuth } from '@/app/guards/RequireAuth';
import { RequirePermission } from '@/app/guards/RequirePermission';

const ProjectListPage = lazy(() =>
  import('@/pages/projects/ProjectListPage').then((m) => ({ default: m.ProjectListPage })),
);

export const router = createBrowserRouter([
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/projects',
        element: (
          <RequirePermission permission="projects.view">
            <ProjectListPage />
          </RequirePermission>
        ),
      },
    ],
  },
]);
```

---

## 7A. Authorization & RBAC Standard

RBAC is a first-class, standardized concern. The UI must render exactly what the
caller is permitted to see and do, but the **backend remains the sole authority**
(MASTER sections 11, 28). Guards and gates are convenience + UX, never the
security boundary. Every permission-gated surface must also degrade gracefully.

### 7A.1 Single permission catalog

Permissions are defined **once** as a typed union mirroring MASTER section 11.
Never inline permission strings anywhere else.

```ts
// types/permissions.ts
export const PERMISSIONS = [
  'organization.manage', 'users.manage', 'roles.manage',
  'integrations.manage', 'audit.view',
  'projects.create', 'projects.view', 'projects.edit',
  'projects.archive', 'projects.close',
  'people.view', 'people.edit', 'people.skills.manage',
  'people.availability.view', 'people.availability.manage', 'people.workload.view',
  'team.recommend', 'team.assign', 'team.remove', 'team.override_capacity',
  'tickets.view', 'tickets.create', 'tickets.edit',
  'tickets.assign', 'tickets.transition',
  'feedback.create', 'feedback.view_shared', 'feedback.view_private',
  'feedback.edit', 'feedback.acknowledge',
  'reports.view', 'reports.generate',
  'assistant.use', 'assistant.propose_actions', 'assistant.approve_actions',
] as const;

export type Permission = (typeof PERMISSIONS)[number];
```

### 7A.2 Session + permission hooks

The authenticated session (permissions resolved by the backend from the user's
roles) is exposed through a single `useSession` hook. Derive permission checks
from it; never read raw roles in components.

```ts
// hooks/usePermissions.ts
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
```

### 7A.3 Route guard (`RequirePermission`)

Route guards are typed against `Permission`, support single/any/all, and render
an accessible fallback instead of leaking a blank screen.

```tsx
// app/guards/RequirePermission.tsx
import type { ReactNode } from 'react';
import { useHasAllPermissions } from '@/hooks/usePermissions';
import { ForbiddenState } from '@/components/shared';
import type { Permission } from '@/types/permissions';

interface RequirePermissionProps {
  permission: Permission | readonly Permission[];
  children: ReactNode;
}

export function RequirePermission({ permission, children }: RequirePermissionProps) {
  const hasAll = useHasAllPermissions();
  const required = Array.isArray(permission) ? permission : [permission];
  if (!hasAll(required)) return <ForbiddenState requiredPermissions={required} />;
  return <>{children}</>;
}
```

### 7A.4 Action gate (`PermissionGate`)

Gate individual actions/controls (buttons, menu items, form fields), not just
routes. A gated action that is hidden must also be blocked server-side.

```tsx
// components/shared/PermissionGate.tsx
import type { ReactNode } from 'react';
import { useHasAllPermissions, useHasAnyPermission } from '@/hooks/usePermissions';
import type { Permission } from '@/types/permissions';

interface PermissionGateProps {
  permission: Permission | readonly Permission[];
  mode?: 'all' | 'any';
  fallback?: ReactNode;
  children: ReactNode;
}

/** Renders children only when the caller holds the required permission(s). */
export function PermissionGate({
  permission,
  mode = 'all',
  fallback = null,
  children,
}: PermissionGateProps) {
  const hasAll = useHasAllPermissions();
  const hasAny = useHasAnyPermission();
  const required = Array.isArray(permission) ? permission : [permission];
  const granted = mode === 'any' ? hasAny(required) : hasAll(required);
  return <>{granted ? children : fallback}</>;
}
```

```tsx
// Usage: gate a mutating action
<PermissionGate permission="team.assign">
  <button type="button" onClick={handleAssign}>Assign to project</button>
</PermissionGate>
```

### 7A.5 Field-level access

Sensitive fields (e.g. private feedback) are only rendered when the caller holds
the specific permission, and the backend must omit them from the payload when
unauthorized (MASTER FR-011, section 28). The UI treats an absent field as
unauthorized — it never guesses.

```tsx
<PermissionGate permission="feedback.view_private">
  {feedback.privateNote ? <PrivateNote value={feedback.privateNote} /> : null}
</PermissionGate>
```

### 7A.6 RBAC rules (must follow)

* Import every permission from [types/permissions.ts](../apps/web/src/types/permissions.ts); no string literals elsewhere.
* Guard routes **and** gate mutating actions with the exact permission the backend enforces.
* A `403` from the API renders `ForbiddenState`; never silently swallow it.
* Never infer permissions from roles in the UI — consume the resolved permission set.
* Hiding a control is UX only; the backend still authorizes every request.
* Cover authorized/unauthorized rendering in component tests (see section 14).

---

## 8. Data Fetching Standard (TanStack Query)

* One query-hook module per feature under `features/<domain>/api`.
* **Centralize query keys** in a typed factory; never inline string arrays.
* Set `staleTime` intentionally; mutations invalidate the relevant keys.
* Surface data freshness where the UI shows it (MASTER FR-006, FR-009).

```ts
// features/projects/api/projectKeys.ts
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (params: ProjectListParams) => [...projectKeys.lists(), params] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};
```

```ts
// features/projects/api/useProjects.ts
import { useQuery } from '@tanstack/react-query';
import { projectsService } from '@/services/projectsService';
import { projectKeys } from './projectKeys';
import type { ProjectListParams } from '../types';

export function useProjects(params: ProjectListParams) {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: ({ signal }) => projectsService.list(params, signal),
    staleTime: 30_000,
  });
}
```

```ts
// features/projects/api/useCreateProject.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService } from '@/services/projectsService';
import { projectKeys } from './projectKeys';
import type { CreateProjectInput } from '../types';

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) => projectsService.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}
```

---

## 9. Service Layer Standard

* `services/` contains the shared HTTP client and one module per domain.
* Services **only** perform HTTP + Zod parsing. No React, no query cache.
* Every response is validated with a Zod schema before returning.
* Every write request carries an **idempotency key** where duplicates are possible (MASTER section 23).

```ts
// services/httpClient.ts
import { z } from 'zod';

export async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`/api/v1${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Correlation-Id': crypto.randomUUID(),
      ...init?.headers,
    },
  });
  if (!response.ok) throw await toApiError(response);
  return schema.parse(await response.json());
}
```

```ts
// services/projectsService.ts
import { request } from './httpClient';
import { ProjectListSchema, ProjectSchema } from '@/features/projects/schemas';
import type { CreateProjectInput, ProjectListParams } from '@/features/projects';

export const projectsService = {
  list: (params: ProjectListParams, signal?: AbortSignal) =>
    request(`/projects?${toQuery(params)}`, ProjectListSchema, { signal }),

  create: (input: CreateProjectInput) =>
    request('/projects', ProjectSchema, {
      method: 'POST',
      headers: { 'Idempotency-Key': crypto.randomUUID() },
      body: JSON.stringify(input),
    }),
};
```

---

## 10. Schemas & Types Standard

* Types are **derived from Zod schemas** via `z.infer`, not hand-written duplicates.
* Shared cross-domain schemas live in `types/`; feature schemas in the feature.
* Dates are ISO 8601 strings across the wire (MASTER section 23); parse to `Date` only in utils/UI.

```ts
// features/projects/schemas.ts
import { z } from 'zod';

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string().min(1),
  status: z.enum([
    'draft', 'staffing', 'ready_for_approval', 'active',
    'on_hold', 'closing', 'completed', 'archived',
  ]),
  startDate: z.string().datetime().nullable(),
  targetEndDate: z.string().datetime().nullable(),
  version: z.number().int().nonnegative(),
});

export const ProjectListSchema = z.object({
  items: z.array(ProjectSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});

export type Project = z.infer<typeof ProjectSchema>;
export type ProjectList = z.infer<typeof ProjectListSchema>;
```

---

## 11. Forms Standard (React Hook Form + Zod)

* One Zod schema per form; wire it via `zodResolver`.
* Field errors are announced accessibly (`aria-invalid`, `aria-describedby`).
* Submit handlers call a mutation hook; the form does not call services directly.

```tsx
// features/projects/components/CreateProjectForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateProjectSchema, type CreateProjectInput } from '../schemas';

interface CreateProjectFormProps {
  onSubmit: (values: CreateProjectInput) => void;
  isSubmitting?: boolean;
}

export function CreateProjectForm({ onSubmit, isSubmitting = false }: CreateProjectFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateProjectInput>({
    resolver: zodResolver(CreateProjectSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label htmlFor="name">Project name</label>
      <input id="name" aria-invalid={!!errors.name}
             aria-describedby={errors.name ? 'name-error' : undefined}
             {...register('name')} />
      {errors.name ? <p id="name-error" role="alert">{errors.name.message}</p> : null}

      <button type="submit" disabled={isSubmitting}>Create project</button>
    </form>
  );
}
```

---

## 12. Zustand Store Standard

* UI-only state. No server records, no derived server data.
* One store per concern; export typed selector hooks, not the whole store.

```ts
// stores/uiStore.ts
import { create } from 'zustand';

interface UiState {
  activeOrganizationId: string | null;
  isSidebarOpen: boolean;
  setActiveOrganization: (id: string) => void;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeOrganizationId: null,
  isSidebarOpen: true,
  setActiveOrganization: (id) => set({ activeOrganizationId: id }),
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
}));

// Selector hooks
export const useActiveOrganization = () =>
  useUiStore((s) => s.activeOrganizationId ?? '');
```

---

## 13. Error Handling Standard

* A single `ApiError` type carries `status`, `code`, `message`, `correlationId`.
* Route-level `ErrorBoundary` catches render errors; queries surface via `ErrorState`.
* Never swallow errors silently; never render raw error objects to users.

---

## 13A. UI State & Interaction Lifecycle Components

Every user interaction has a lifecycle, and **every state in that lifecycle must
render a proper, designed component** — never a blank screen, a raw spinner, or a
raw error object. These components live once in `components/shared/` and are
reused everywhere. Visual styling follows [DESIGN_GUIDELINES.md](DESIGN_GUIDELINES.md)
(skeletons over spinners, status with icon + label, one primary action).

### 13A.1 The canonical state set

There are two lifecycles. Use the matching component set for each.

**A. Data-fetch lifecycle** (reads — TanStack Query):

| State       | Component                | When                                        |
| ----------- | ------------------------ | ------------------------------------------- |
| Loading     | `LoadingState` / `Skeleton` | `isPending` (first load)                 |
| Empty       | `EmptyState`             | Success but zero results                     |
| Error       | `ErrorState`             | `isError` (with retry)                       |
| Forbidden   | `ForbiddenState`         | `403` / missing permission (section 7A)      |
| Offline     | `OfflineState`           | Network unavailable / `fetch` failed         |
| Success     | (the feature UI)         | Data present                                 |
| Refetching  | inline `Spinner`/`isFetching` badge | Background refresh over stale data |
| Partial     | `PartialDataNotice`      | Some data missing/stale (MASTER FR-005/006)  |

**B. Action/mutation lifecycle** (writes — forms, buttons):

| State       | Mechanism                         | When                          |
| ----------- | --------------------------------- | ----------------------------- |
| Idle        | default control                   | Before submit                 |
| Validating  | field errors (`role="alert"`)     | Client validation fails       |
| Submitting  | `isSubmitting` / `isPending` → disabled + spinner-in-button | In flight |
| Success     | `toast.success` + cache invalidate | Mutation resolved            |
| Error       | `toast.error` + inline `FormError` | Mutation rejected            |
| Confirming  | `ConfirmDialog`                   | Destructive / high-impact (MASTER 8.4) |
| Disabled    | gated control (`PermissionGate`)  | Caller lacks permission       |

Rule: a container renders **A**; a form/action renders **B**. A page that both
lists and mutates uses both.

### 13A.2 Shared component contracts

```tsx
// components/shared/states/types.ts
import type { ReactNode } from 'react';
import type { Permission } from '@/types/permissions';
import type { ApiError } from '@/services/httpClient';

export interface LoadingStateProps {
  label: string;                 // screen-reader announced
  variant?: 'inline' | 'block' | 'skeleton';
  rows?: number;                 // skeleton rows
  className?: string;
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: { label: string; onClick: () => void; permission?: Permission };
  className?: string;
}

export interface ErrorStateProps {
  error: ApiError | Error;
  onRetry?: () => void;          // omit when not retryable
  className?: string;
}

export interface ForbiddenStateProps {
  requiredPermissions: readonly Permission[];
  className?: string;
}

export interface OfflineStateProps {
  onRetry?: () => void;
  className?: string;
}
```

```tsx
// components/shared/states/LoadingState.tsx
import { cn } from '@/utils/cn';
import type { LoadingStateProps } from './types';

/** Calm loading state. Prefers skeletons for content areas (DESIGN_GUIDELINES §8). */
export function LoadingState({ label, variant = 'skeleton', rows = 3, className }: LoadingStateProps) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={cn('space-y-3', className)}>
      <span className="sr-only">{label}</span>
      {variant === 'skeleton'
        ? Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-md bg-surface-muted" />
          ))
        : <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />}
    </div>
  );
}
```

```tsx
// components/shared/states/EmptyState.tsx
import { cn } from '@/utils/cn';
import { PermissionGate } from '@/components/shared/PermissionGate';
import type { EmptyStateProps } from './types';

/** Designed empty state with an optional (permission-gated) primary action. */
export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3 rounded-lg border border-border bg-surface p-8 text-center', className)}>
      {icon ? <div aria-hidden className="text-fg-muted">{icon}</div> : null}
      <h2 className="text-lg font-semibold text-fg">{title}</h2>
      {description ? <p className="max-w-prose text-sm text-fg-muted">{description}</p> : null}
      {action ? (
        <PermissionGate permission={action.permission ?? []} mode="all">
          <button type="button" onClick={action.onClick} className="mt-1">
            {action.label}
          </button>
        </PermissionGate>
      ) : null}
    </div>
  );
}
```

```tsx
// components/shared/states/ErrorState.tsx
import { cn } from '@/utils/cn';
import { AlertTriangle } from 'lucide-react';
import type { ErrorStateProps } from './types';

/** Error state pairs an icon + label (never color alone) and surfaces the correlation id. */
export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  const correlationId = 'correlationId' in error ? error.correlationId : undefined;
  return (
    <div role="alert" className={cn('flex flex-col items-center gap-3 rounded-lg border border-danger/30 bg-surface p-8 text-center', className)}>
      <AlertTriangle aria-hidden className="text-danger" />
      <h2 className="text-lg font-semibold text-fg">Something went wrong</h2>
      <p className="text-sm text-fg-muted">{error.message}</p>
      {correlationId ? <p className="text-xs text-fg-muted">Reference: {correlationId}</p> : null}
      {onRetry ? <button type="button" onClick={onRetry} className="mt-1">Try again</button> : null}
    </div>
  );
}
```

`ForbiddenState` (section 7A) and `OfflineState` follow the same shape: icon +
label + description, and an action only where one is meaningful.

### 13A.3 Consuming states — container (reads)

Containers must handle the full data-fetch lifecycle explicitly and in order:

```tsx
// features/projects/containers/ProjectListContainer.tsx
export function ProjectListContainer({ organizationId }: ProjectListContainerProps) {
  const { data, isPending, isError, error, refetch } = useProjects({ organizationId });

  if (isPending) return <LoadingState label="Loading projects" variant="skeleton" rows={5} />;
  if (isError && error.status === 403) return <ForbiddenState requiredPermissions={['projects.view']} />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (data.items.length === 0) {
    return <EmptyState title="No projects yet" description="Create your first project to get started."
                        action={{ label: 'New project', onClick: onCreate, permission: 'projects.create' }} />;
  }
  return <ProjectList items={data.items} />; // success
}
```

To avoid repetition, an optional `QueryBoundary` helper renders the standard
states so containers only supply the success view:

```tsx
// components/shared/states/QueryBoundary.tsx
import type { UseQueryResult } from '@tanstack/react-query';

interface QueryBoundaryProps<T> {
  query: UseQueryResult<T, ApiError>;
  loadingLabel: string;
  isEmpty?: (data: T) => boolean;
  empty?: ReactNode;
  children: (data: T) => ReactNode;
}

export function QueryBoundary<T>({ query, loadingLabel, isEmpty, empty, children }: QueryBoundaryProps<T>) {
  if (query.isPending) return <LoadingState label={loadingLabel} />;
  if (query.isError && query.error.status === 403) return <ForbiddenState requiredPermissions={[]} />;
  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />;
  if (isEmpty?.(query.data) && empty) return <>{empty}</>;
  return <>{children(query.data)}</>;
}
```

### 13A.4 Consuming states — action/mutation lifecycle

Mutations drive the button/form lifecycle. Success and error are always
surfaced; destructive actions confirm first (MASTER 8.4).

```tsx
// features/team/containers/AssignButton.tsx
import { toast } from '@/components/shared/toast';
import { ConfirmDialog } from '@/components/shared';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { useAssignEmployee } from '@/features/team';

export function AssignButton({ candidateId, roleId }: AssignButtonProps) {
  const assign = useAssignEmployee();

  const handleConfirm = () =>
    assign.mutate(
      { candidateId, roleId },
      {
        onSuccess: () => toast.success('Assignment confirmed'),
        onError: (error) => toast.error(error.message),
      },
    );

  return (
    <PermissionGate permission="team.assign">
      <ConfirmDialog
        title="Confirm assignment?"
        description="This updates the employee's capacity."
        confirmLabel="Assign"
        isPending={assign.isPending}          // submitting → disabled + spinner
        onConfirm={handleConfirm}
        trigger={<button type="button">Assign to project</button>}
      />
    </PermissionGate>
  );
}
```

Form submit state uses the same lifecycle (see section 11): `isSubmitting`
disables the primary button and shows an in-button spinner; field-level
validation errors use `role="alert"`; submit failures surface via toast +
inline `FormError`.

### 13A.5 Route & app-level lifecycle

* Every lazy route group has a `<Suspense fallback={<LoadingState .../>}>`.
* Every route group has an `<ErrorBoundary fallback={<ErrorState .../>}>`.
* A global `<OfflineBanner>` observes connectivity and renders `OfflineState`
  context when offline; queries retry on reconnect.
* A `<NotFoundPage>` (`EmptyState` variant) handles unknown routes.

### 13A.6 Rules (must follow)

* Never render a bare spinner, blank node, or raw error text. Use these components.
* Handle all four page states — loading, empty, error, success — plus forbidden
  and offline where reachable (non-negotiable rule #4, MASTER section 25).
* Order checks: `isPending` → `403 → ForbiddenState` → `ErrorState` → empty → success.
* Loading uses skeletons for content areas; spinners only inline/in-button.
* Empty states offer the next action, gated by permission when it mutates.
* Errors show a human message + correlation id; provide retry when retryable.
* Mutations always resolve to a visible success or error outcome.
* Destructive / high-impact actions confirm via `ConfirmDialog` first.
* Every state component is keyboard reachable and screen-reader announced
  (`role="status"` / `role="alert"`, `aria-live`).

---

## 14. Testing Standard

| Level      | Tool                    | Location                    |
| ---------- | ----------------------- | --------------------------- |
| Unit       | Vitest                  | `*.test.ts` next to source  |
| Component  | React Testing Library   | `*.test.tsx` next to source |
| E2E        | Playwright              | `apps/web/tests/e2e`        |

* Test behavior and accessibility roles, not implementation details.
* Query by role/label (`getByRole`, `getByLabelText`), not test ids where possible.
* Each feature ships tests for its container states (loading/empty/error/success),
  plus forbidden and offline where reachable, and mutation success/error outcomes
  (section 13A).
* RBAC: test both authorized and unauthorized rendering for guarded routes and
  gated actions (`RequirePermission`, `PermissionGate`), and that a `403`
  renders `ForbiddenState` (section 7A).
* Mandatory scenarios from MASTER section 32 that touch the UI must have E2E coverage.

---

## 15. Accessibility Standard (WCAG 2.2 AA — MASTER section 29)

* Visual design follows [DESIGN_GUIDELINES.md](DESIGN_GUIDELINES.md): Starbucks-inspired,
  clean, minimalist, premium. Use semantic token classes only (`bg-primary`,
  `text-fg-muted`, `border-border`), never raw hex or palette steps.
* Semantic landmarks (`main`, `nav`, `header`), one `h1` per page.
* All interactive elements keyboard-reachable with visible focus.
* Status uses text/icon, never color alone.
* Dialogs trap focus and restore it on close; tables have proper headers.
* Form errors use `role="alert"` and are associated via `aria-describedby`.

---

## 16. Definition of Done (Frontend)

```text
[ ] Simplest solution that meets the requirement; no overengineering (section 0)
[ ] Follows folder + naming conventions
[ ] Named exports only; no `any`
[ ] Server state via TanStack Query; no server data in Zustand
[ ] Zod validation at the boundary; types inferred from schemas
[ ] Loading / empty / error / success states present
[ ] Interaction lifecycle uses shared state components (13A): loading (skeleton),
    empty, error (retry + correlation id), forbidden, offline, refetching, partial;
    mutations resolve to toast success/error; destructive actions use ConfirmDialog
[ ] Route guarded; permission checked (UI + backend)
[ ] RBAC: permissions from types/permissions.ts; actions gated with PermissionGate; 403 -> ForbiddenState
[ ] Accessible (roles, labels, focus, contrast)
[ ] Unit/component tests added; E2E where required
[ ] pnpm lint, pnpm test, pnpm build all pass
```
