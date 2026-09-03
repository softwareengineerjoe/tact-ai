# UX Flows

**Status:** Companion document. Derived from [MASTER.md](MASTER.md).

The single source of truth is [MASTER.md](MASTER.md). When anything here conflicts
with the master, the master wins unless an approved ADR changes it.

## Main User Journey

See MASTER section 9. Create Project → Define Roles/Skills → Find Employees →
Recommendations → Approve Team → Create/Assign Tickets → Track → Feedback →
Ask AI → Close & Release.

## Routes

See MASTER section 24 for the full route list (`/assistant`, `/dashboard`,
`/projects/...`, `/people/...`, `/tickets`, `/reports`, `/admin/...`).

## Screens

See MASTER section 25. Every screen must define authorized roles, primary
actions, required fields, validation, loading/empty/error/success states,
responsive behavior, and accessibility requirements.

## Wireframes

* Main wireframe — MASTER section 26.
* Team Builder wireframe — MASTER section 27.

## Visual Design

All UI follows [DESIGN_GUIDELINES.md](DESIGN_GUIDELINES.md): a clean, minimalist,
premium look inspired by the Starbucks brand palette and design patterns, built
on Tailwind + shadcn/ui with semantic design tokens.

## Accessibility

Target WCAG 2.2 AA. See MASTER section 29 (Accessibility).
