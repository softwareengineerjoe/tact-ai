import type { Config } from 'tailwindcss';

// Semantic tokens are wired to CSS variables in src/app/theme.css
// (DESIGN_GUIDELINES section 9). Components use semantic classes only.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
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
        surface: {
          DEFAULT: 'var(--color-surface)',
          muted: 'var(--color-surface-muted)',
        },
        fg: {
          DEFAULT: 'var(--color-fg)',
          body: 'var(--color-fg-body)',
          muted: 'var(--color-fg-muted)',
        },
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
  plugins: [],
} satisfies Config;
