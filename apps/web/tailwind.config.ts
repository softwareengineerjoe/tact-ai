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
        'accent-gold': 'var(--color-accent-gold)',
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
      // Premium = soft, low, diffuse shadows (DESIGN_GUIDELINES section 4).
      // Tinted with ink (#1b1a17) for a warm, calm elevation.
      boxShadow: {
        xs: '0 1px 2px 0 rgb(27 26 23 / 0.05)',
        sm: '0 1px 3px 0 rgb(27 26 23 / 0.08), 0 1px 2px -1px rgb(27 26 23 / 0.06)',
        md: '0 4px 12px -2px rgb(27 26 23 / 0.10), 0 2px 6px -3px rgb(27 26 23 / 0.08)',
        lg: '0 12px 28px -8px rgb(27 26 23 / 0.18), 0 4px 10px -6px rgb(27 26 23 / 0.10)',
      },
      ringOffsetColor: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
      },
    },
  },
  plugins: [],
} satisfies Config;
