# Skill: design-system

**Goal:** Apply the clean, minimalist, premium Starbucks-inspired visual language
consistently through design tokens.

## Use when

Styling any UI, choosing colors/typography/spacing, building a shared component's
look, or reviewing visual polish and accessibility contrast.

## Read first

* [DESIGN_GUIDELINES.md](../../docs/DESIGN_GUIDELINES.md) — palette, type, spacing,
  components, tokens, motion.
* [FRONTEND_STANDARDS.md](../../docs/FRONTEND_STANDARDS.md) §13A (state components), §15 (a11y).
* [MASTER.md](../../docs/MASTER.md) §26, §27 (wireframes), §29 (accessibility).

## Steps

1. Use semantic token classes only (`bg-primary`, `text-fg-muted`,
   `border-border`) — never raw hex or palette steps in components.
2. Green is an accent, not a flood; most surfaces are white/cream. One accent per
   view (gold is rare/premium only).
3. Follow the type scale (one `h1` per page) and the spacing/radius/elevation scales.
4. Pair every status color with an icon/label (never color alone); map health to
   success/warning/danger.
5. Loading uses skeletons; empty/error states are designed, not default.
6. Respect `prefers-reduced-motion`; keep motion subtle (120–200ms).
7. Add a new token to `theme.css` + Tailwind map first, then use it.

## Guardrails

* Meet WCAG 2.2 AA contrast (DESIGN_GUIDELINES §2.4).
* No trademarked Starbucks assets (logo, siren) — inspired-by palette only.
* No new fonts/radii/shadows outside the scale without an ADR.

## Definition of Done

Use the DESIGN_GUIDELINES §12 checklist.
