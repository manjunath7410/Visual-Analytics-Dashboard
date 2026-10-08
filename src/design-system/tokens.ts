/**
 * Visual Analytics Dashboard Design System Tokens
 * Centralized design tokens for colors, typography, spacing, radii, shadows, and transitions.
 */

export const tokens = {
  // Color Palette Tokens
  colors: {
    // Canvas & Structural Surfaces
    canvas: {
      light: '#f8fafc', // slate-50
      dark: '#090d16',   // deep navy slate
    },
    surface: {
      light: '#ffffff',
      dark: '#0f172a',   // slate-900
    },
    surfaceElevated: {
      light: '#f1f5f9', // slate-100
      dark: '#1e293b',   // slate-800
    },
    surfaceSubtle: {
      light: '#f8fafc',
      dark: '#141d2e',
    },

    // Borders
    border: {
      light: '#e2e8f0', // slate-200
      lightSubtle: '#f1f5f9',
      dark: 'rgba(30, 41, 59, 0.8)', // slate-800/80
      darkSubtle: 'rgba(30, 41, 59, 0.4)',
      focus: '#6366f1', // indigo-500
    },

    // Typography
    text: {
      primary: {
        light: '#0f172a', // slate-900
        dark: '#f8fafc',   // slate-50
      },
      secondary: {
        light: '#475569', // slate-600
        dark: '#94a3b8',   // slate-400
      },
      muted: {
        light: '#94a3b8', // slate-400
        dark: '#64748b',   // slate-500
      },
      disabled: {
        light: '#cbd5e1', // slate-300
        dark: '#475569',   // slate-600
      },
    },

    // Brand Accents (60-30-10 discipline: 10% accent budget)
    brand: {
      primary: '#4f46e5', // indigo-600
      primaryHover: '#4338ca',
      primaryLight: '#eef2ff',
      primaryDark: '#3730a3',
      secondary: '#0ea5e9', // sky-500
      secondaryLight: '#f0f9ff',
    },

    // Semantic States (Must pair with icons / text, never color alone)
    semantic: {
      success: {
        main: '#16a34a', // emerald-600
        light: '#ecfdf5',
        dark: '#064e3b',
        border: '#a7f3d0',
      },
      warning: {
        main: '#d97706', // amber-600
        light: '#fffbeb',
        dark: '#78350f',
        border: '#fde68a',
      },
      danger: {
        main: '#dc2626', // rose-600
        light: '#fef2f2',
        dark: '#7f1d1d',
        border: '#fecaca',
      },
      info: {
        main: '#2563eb', // blue-600
        light: '#eff6ff',
        dark: '#1e3a8a',
        border: '#bfdbfe',
      },
    },

    // Coordinated Chart Palette (Colorblind-safe, distinct hues)
    charts: [
      '#6366f1', // Indigo
      '#0ea5e9', // Sky Blue
      '#10b981', // Emerald
      '#f59e0b', // Amber
      '#ec4899', // Pink
      '#8b5cf6', // Violet
      '#14b8a6', // Teal
      '#f97316', // Orange
    ],
  },

  // Spacing Scale
  spacing: {
    xs: '0.25rem',  // 4px
    sm: '0.5rem',   // 8px
    md: '0.75rem',  // 12px
    lg: '1rem',     // 16px
    xl: '1.5rem',   // 24px
    '2xl': '2rem',  // 32px
    '3xl': '3rem',  // 48px
  },

  // Border Radius Scale
  radius: {
    none: '0',
    sm: '0.25rem',  // 4px - small controls, badges
    md: '0.375rem', // 6px - inputs, buttons
    lg: '0.5rem',   // 8px - dropdowns, segmented controls
    xl: '0.75rem',  // 12px - cards, chart containers
    '2xl': '1rem',  // 16px - modals, large panels
    full: '9999px', // round buttons, avatar badges
  },

  // Subtle Shadows Scale (No excessive floating layers)
  shadows: {
    none: 'none',
    '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    xs: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -2px rgba(0, 0, 0, 0.08)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    modal: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.15)',
  },

  // Micro-interaction Timings
  transitions: {
    fast: '150ms cubic-bezier(0.16, 1, 0.3, 1)',
    normal: '200ms cubic-bezier(0.16, 1, 0.3, 1)',
    slow: '300ms cubic-bezier(0.16, 1, 0.3, 1)',
  },

  // Component Sizing Standards
  components: {
    buttonHeight: {
      xs: '24px',
      sm: '32px',
      md: '36px',
      lg: '42px',
    },
    inputHeight: {
      sm: '32px',
      md: '36px',
      lg: '42px',
    },
    tableRowHeight: {
      compact: '36px',
      comfortable: '44px',
    },
  },
} as const;

export type ThemeTokens = typeof tokens;
