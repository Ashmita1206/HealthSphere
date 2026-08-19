/**
 * HealthSphere Design System v1.1.0 - Typography Tokens
 * Primary UI: Plus Jakarta Sans
 * Editorial Accent: Instrument Serif (Narrative greetings only)
 * Monospace/Tabular Figures: Plus Jakarta Sans + font-feature-settings: 'tnum' 1, 'lnum' 1
 */

export const typography = {
  fontFamily: {
    sans: ["'Plus Jakarta Sans'", "Inter", "-apple-system", "sans-serif"],
    editorial: ["'Instrument Serif'", "Georgia", "serif"],
    numeric: ["'Plus Jakarta Sans'", "monospace"],
  },

  fontSize: {
    display:    { size: '2.25rem',  lineHeight: '2.575rem', letterSpacing: '-0.025em', weight: '700' }, // 36px
    h1:         { size: '1.75rem',  lineHeight: '2.1875rem', letterSpacing: '-0.020em', weight: '700' }, // 28px
    h2:         { size: '1.375rem', lineHeight: '1.75rem',   letterSpacing: '-0.015em', weight: '600' }, // 22px
    h3:         { size: '1.125rem', lineHeight: '1.5rem',    letterSpacing: '-0.010em', weight: '600' }, // 18px
    bodyLg:     { size: '1.00rem',  lineHeight: '1.625rem',  letterSpacing: '0.000em',  weight: '400' }, // 16px (AI Response)
    bodyMd:     { size: '0.875rem', lineHeight: '1.3125rem', letterSpacing: '0.000em',  weight: '400' }, // 14px (Standard)
    caption:    { size: '0.75rem',  lineHeight: '1.0625rem', letterSpacing: '+0.010em', weight: '500' }, // 12px
    label:      { size: '0.6875rem',lineHeight: '0.875rem',  letterSpacing: '+0.050em', weight: '600' }, // 11px uppercase
    metricXl:   { size: '2.75rem',  lineHeight: '2.75rem',   letterSpacing: '-0.030em', weight: '700' }, // 44px
    metricLg:   { size: '1.75rem',  lineHeight: '1.9375rem', letterSpacing: '-0.020em', weight: '700' }, // 28px
  },

  fontWeight: {
    regular: '400',
    medium:  '500',
    semibold:'600',
    bold:    '700',
  },
} as const;

export type TypographyTokens = typeof typography;
