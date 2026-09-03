# Design Guidelines

**Status:** Binding standard. Derived from [MASTER.md](MASTER.md) (sections 18.1, 25, 29) and
implemented alongside [FRONTEND_STANDARDS.md](FRONTEND_STANDARDS.md).

The single source of truth is [MASTER.md](MASTER.md). This document defines the
**visual language** for TACT AI: a clean, minimalist, premium interface inspired
by the Starbucks brand palette and design patterns. Every screen, component, and
page MUST follow these tokens and rules. When anything here conflicts with the
master, the master wins unless an approved ADR changes it.

> Note: This is an *inspired-by* design language for an internal product. Do not
> use Starbucks logos, the siren mark, trademarks, or copyrighted assets. We
> borrow the palette mood, generosity of whitespace, and calm premium feel only.

---

## 1. Design Principles

1. **Calm and premium.** Generous whitespace, restrained color, confident type.
   Green is an accent, not a flood. Most surfaces are white/near-white.
2. **Minimalist, not sparse.** Every element earns its place; remove decoration
   that does not aid comprehension or action.
3. **Content first.** Data, people, and projects are the hero — chrome recedes.
4. **One primary action per view.** Guide the eye to the single most important
   next step; everything else is secondary or tertiary.
5. **Quiet feedback.** Motion and color changes are subtle and purposeful.
6. **Accessible by construction.** WCAG 2.2 AA is a floor, not a goal
   (MASTER section 29). Never signal state with color alone.
7. **Consistent rhythm.** Spacing, radius, and elevation come from the scale —
   no magic numbers.

---

## 2. Brand Palette (Starbucks-inspired)

Colors are expressed as design tokens. Never hardcode hex values in components;
use the semantic Tailwind classes wired to these tokens (see section 9).

### 2.1 Core brand

| Token             | Hex        | Role                                              |
| ----------------- | ---------- | ------------------------------------------------- |
| `green-900`       | `#0B3D2E`  | Deepest brand green — text on light, dark surfaces |
| `green-800`       | `#0E4A34`  | Sidebar/header on dark theme, pressed states       |
| `green-700`       | `#00754A`  | **Primary brand green** (Starbucks house green)    |
| `green-600`       | `#1E8C63`  | Hover for primary                                  |
| `green-500`       | `#3FA57B`  | Active/subtle accents                              |
| `green-100`       | `#D4E9E0`  | Subtle green fills, selected rows                  |
| `green-50`        | `#EEF6F2`  | Faint green background wash                         |
| `accent-gold`     | `#C6A15B`  | Rare premium accent (awards, highlights) — use sparingly |

### 2.2 Neutrals (the workhorse)

| Token         | Hex        | Role                                        |
| ------------- | ---------- | ------------------------------------------- |
| `cream`       | `#F7F4EC`  | Warm app background (premium, not stark)    |
| `white`       | `#FFFFFF`  | Cards, surfaces, inputs                     |
| `stone-100`   | `#F2EFE9`  | Muted surface, table stripes                |
| `stone-200`   | `#E7E2D9`  | Borders, dividers                           |
| `stone-400`   | `#B8AFA2`  | Disabled text, placeholders                 |
| `stone-600`   | `#6B6357`  | Muted/secondary text                        |
| `stone-800`   | `#33302B`  | Body text                                   |
| `ink`         | `#1B1A17`  | Headings, highest-contrast text             |

### 2.3 Functional / status

Status must always pair color with an icon and/or label (never color alone).

| Token         | Hex        | Role                        |
| ------------- | ---------- | --------------------------- |
| `success`     | `#00754A`  | Healthy / Green project     |
| `warning`     | `#B8860B`  | Amber project / attention   |
| `danger`      | `#B4232A`  | Red project / destructive   |
| `info`        | `#2A6F97`  | Neutral information         |

Map product concepts directly: Project Health Green → `success`,
Amber → `warning`, Red → `danger` (MASTER FR-014).

### 2.4 Contrast rules

* Body text on `cream`/`white`: use `stone-800` or `ink` (≥ 4.5:1).
* `green-700` is the minimum green for text/icons on white (passes AA for
  large text and UI; use `green-900` for small text on light).
* White text is only allowed on `green-700` or darker.
* Never place `green-500`/`green-600` text on white for body copy.

---

## 3. Typography

Premium feel comes from a confident type scale and restraint.

* **Font family:** system-first, humanist sans.
  `ui-sans-serif, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`.
  A single optional display face may be introduced via an ADR; do not add
  multiple custom fonts.
* **Weights:** 400 (body), 500 (labels/UI), 600 (headings), 700 (rare emphasis).
* **Numerals:** use tabular figures for tables, capacity %, and metrics.

### Type scale

| Token        | Size / Line      | Weight | Use                          |
| ------------ | ---------------- | ------ | ---------------------------- |
| `display`    | 36 / 40          | 600    | Marketing/empty-state hero   |
| `h1`         | 28 / 34          | 600    | Page title (one per page)    |
| `h2`         | 22 / 28          | 600    | Section heading              |
| `h3`         | 18 / 24          | 600    | Card/subsection heading      |
| `body-lg`    | 16 / 24          | 400    | Primary reading text         |
| `body`       | 14 / 20          | 400    | Default UI text              |
| `label`      | 13 / 16          | 500    | Form labels, table headers   |
| `caption`    | 12 / 16          | 500    | Metadata, timestamps, hints  |

Rules:

* Exactly one `h1` per page (matches the accessibility rule in
  [FRONTEND_STANDARDS.md](FRONTEND_STANDARDS.md) section 15).
* Line length for reading text: 60–75 characters max.
* Avoid all-caps except short `caption`/`label` eyebrows with letter-spacing.

---

## 4. Spacing, Radius, Elevation

### Spacing scale (4px base)

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64`. Use Tailwind steps (`1 = 4px`).
Default component padding is `16` (`p-4`); section gaps `24`–`32`.

### Radius

| Token        | Value  | Use                          |
| ------------ | ------ | ---------------------------- |
| `radius-sm`  | 6px    | Inputs, badges, chips        |
| `radius-md`  | 10px   | Buttons, cards               |
| `radius-lg`  | 16px   | Panels, modals, large cards  |
| `radius-full`| 9999px | Avatars, pills, status dots  |

Rounded but not playful. Prefer `radius-md` for most interactive surfaces.

### Elevation (shadows)

Premium = soft, low, diffuse shadows. No harsh drop shadows.

| Token       | Use                                      |
| ----------- | ---------------------------------------- |
| `shadow-xs` | Resting cards, table containers          |
| `shadow-sm` | Hover on cards, dropdowns                |
| `shadow-md` | Popovers, menus                          |
| `shadow-lg` | Modals, dialogs                          |

Borders (`stone-200`) do most of the separation work; shadows are the accent.

---

## 5. Layout

* **App shell:** fixed left sidebar (nav) + top bar (search, notifications,
  profile) + scrollable content, matching the wireframe in MASTER section 26.
* **Sidebar:** dark green surface (`green-800`) with `cream`/white text; active
  item uses a subtle `green-700` fill and a 2px left accent bar.
* **Content max width:** `1280px` centered for reading-heavy views; full-bleed
  allowed for boards and tables.
* **Grid:** 12-column, `24px` gutters. Cards snap to the grid.
* **Density:** comfortable by default; offer a compact table mode for
  data-heavy screens (tickets, people directory).
* **Whitespace:** never fear empty space — it signals premium calm.

---

## 6. Core Components (visual spec)

Components are built on **shadcn/ui + Tailwind** (MASTER 18.1). These are the
visual defaults; behavior/structure lives in
[FRONTEND_STANDARDS.md](FRONTEND_STANDARDS.md).

### Buttons

| Variant     | Look                                                        |
| ----------- | ---------------------------------------------------------- |
| Primary     | `green-700` bg, white text; hover `green-600`; press `green-800` |
| Secondary   | White bg, `stone-200` border, `stone-800` text; hover `stone-100` |
| Ghost       | Transparent, `stone-800` text; hover `stone-100`            |
| Destructive | `danger` bg, white text; hover darker                       |
| Link        | `green-700` text, underline on hover                        |

* One primary button per view/section. Height 40px (`h-10`), `radius-md`,
  `label` weight 500. Icon + text uses `8px` gap.
* Disabled: `stone-100` bg, `stone-400` text, no shadow.

### Inputs & forms

* White bg, `stone-200` border, `radius-sm`, 40px height.
* Focus: 2px `green-600` ring (`ring-2 ring-offset-1`), never remove the outline.
* Error: `danger` border + `role="alert"` helper text (FRONTEND_STANDARDS 11).
* Labels are `label` tokens above the field; required marked with text, not
  color alone.

### Cards & panels

* White surface, `stone-200` border, `radius-lg`, `shadow-xs`, `p-4`/`p-6`.
* Card heading `h3`; supporting text `stone-600`.
* Selected/active card: `green-500` 2px ring + `green-50` wash.

### Tables

* Header row: `stone-100` bg, `label` text, `stone-600`.
* Rows: white with `stone-200` bottom border; hover `green-50`.
* Zebra optional via `stone-100`. Numeric columns right-aligned, tabular figures.
* Sticky header on scroll; never color-only status cells.

### Badges / status pills

* Pill shape (`radius-full`), `caption` weight 500, icon + label.
* Health: Green `success`+`green-50`; Amber `warning`+`#FBF3E0`;
  Red `danger`+`#FBECEC`. Always include a text label and a status dot/icon.

### Navigation

* Sidebar items: `body` text, 40px tall, `8px` icon gap; active = `green-700`
  fill on the dark sidebar + left accent bar.
* Top bar: white/`cream`, `stone-200` bottom border, search field centered-left.

### Dialogs / modals

* `radius-lg`, `shadow-lg`, `24px` padding, focus-trapped, ESC to close,
  restore focus on close (FRONTEND_STANDARDS 15). Overlay: `ink` at 40% opacity.

### AI Assistant surfaces

* Full-page and side-panel assistant (MASTER FR-020). Use a calm layout: white
  message surface, user bubbles in `green-50`, assistant text on white.
* Show data-freshness, sources, and warnings as quiet `caption` metadata under
  answers (MASTER 15.7). Action proposals render in a bordered `radius-md` card
  with a clear primary confirm and secondary reject.

---

## 7. Iconography & Imagery

* **Icons:** one line-icon set (e.g. Lucide, already common with shadcn/ui),
  `1.5px` stroke, 20–24px. Consistent metaphor across the app.
* Icons carry `aria-hidden` when decorative; interactive icons have labels.
* **Imagery:** minimal. Prefer illustration/empty-state art in brand green +
  neutrals over stock photography. No busy backgrounds behind data.
* **Avatars:** circular, initials fallback on `green-100`/`green-700`.

---

## 8. Motion

* Purposeful and subtle. Durations `120–200ms`, ease-out for enters,
  ease-in for exits.
* Hover/press transitions on color and shadow only (`transition-colors`,
  `transition-shadow`). Avoid large translate/scale on data elements.
* Respect `prefers-reduced-motion`: disable non-essential animation.
* Loading uses calm skeletons (neutral shimmer), not spinners, for content areas.

---

## 9. Design Tokens in Code

Tokens are declared once as CSS variables and mapped into the Tailwind theme so
components only ever use semantic classes (`bg-primary`, `text-muted`,
`border-subtle`). No raw hex in components (FRONTEND_STANDARDS rule set).

```css
/* apps/web/src/app/theme.css — token source of truth */
:root {
  /* Brand */
  --color-primary: #00754A;        /* green-700 */
  --color-primary-hover: #1E8C63;  /* green-600 */
  --color-primary-active: #0E4A34; /* green-800 */
  --color-primary-fg: #FFFFFF;
  --color-primary-subtle: #EEF6F2; /* green-50 */
  --color-accent-gold: #C6A15B;

  /* Surfaces */
  --color-bg: #F7F4EC;             /* cream */
  --color-surface: #FFFFFF;
  --color-surface-muted: #F2EFE9;  /* stone-100 */

  /* Text */
  --color-fg: #1B1A17;             /* ink */
  --color-fg-body: #33302B;        /* stone-800 */
  --color-fg-muted: #6B6357;       /* stone-600 */

  /* Lines */
  --color-border: #E7E2D9;         /* stone-200 */

  /* Status */
  --color-success: #00754A;
  --color-warning: #B8860B;
  --color-danger: #B4232A;
  --color-info: #2A6F97;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
}
```

```ts
// tailwind.config.ts — map tokens to semantic utilities
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          active: 'var(--color-primary-active)',
          fg: 'var(--color-primary-fg)',
          subtle: 'var(--color-primary-subtle)',
        },
        bg: 'var(--color-bg)',
        surface: { DEFAULT: 'var(--color-surface)', muted: 'var(--color-surface-muted)' },
        fg: { DEFAULT: 'var(--color-fg)', body: 'var(--color-fg-body)', muted: 'var(--color-fg-muted)' },
        border: 'var(--color-border)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        info: 'var(--color-info)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
    },
  },
} satisfies import('tailwindcss').Config;
```

Rules:

* Components reference semantic classes (`bg-primary`, `text-fg-muted`,
  `border-border`), never hex or raw palette steps.
* A dark theme may be added later by overriding the same variables under a
  `.dark` scope — no component changes required.
* Any new token requires updating this file first, then the Tailwind map.

---

## 10. Dark & High-Contrast (future-ready)

* Design tokens make theming a variable swap. Dark theme uses `green-900` app
  background, `green-800` surfaces, `cream` text.
* Provide a high-contrast pass that raises all text to `ink` and thickens
  borders to meet AA+ where needed.
* Never ship a theme that fails the contrast rules in section 2.4.

---

## 11. Do / Don't

**Do**

* Lead with whitespace and neutrals; use green to direct attention.
* Keep one clear primary action per screen.
* Pair every status color with an icon/label.
* Use soft shadows + subtle borders for separation.

**Don't**

* Flood screens with green or use green for large backgrounds behind text.
* Use more than one accent color per view (gold is rare/premium only).
* Signal meaning with color alone.
* Introduce new fonts, radii, or shadows outside the scale without an ADR.
* Use Starbucks logos, the siren, or any trademarked/copyrighted assets.

---

## 12. Design Definition of Done

```text
[ ] Uses semantic token classes only (no raw hex / palette steps in components)
[ ] One h1 and one primary action per view
[ ] Spacing, radius, elevation come from the scale
[ ] Status uses color + icon/label (never color alone)
[ ] Text meets WCAG 2.2 AA contrast (section 2.4)
[ ] Focus states visible; motion respects prefers-reduced-motion
[ ] Loading uses skeletons; empty/error states are designed, not default
[ ] No trademarked Starbucks assets used
```
