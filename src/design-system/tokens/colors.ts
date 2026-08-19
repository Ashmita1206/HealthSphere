/**
 * HealthSphere Design System v1.1.0 - Color Tokens
 * Absolute Rule: NO BLUE, NO PURPLE.
 */

export const colors = {
  // Brand & Primary Teal Palette
  primary: {
    950: '#042F2C', // Deepest brand ink
    900: '#0D4B46', // High-contrast clinical titles
    800: '#0F766E', // Primary Brand Teal
    700: '#115E59', // Hover state
    600: '#14B8A6', // Focus ring & active border
    500: '#2DD4BF', // Interactive accent
    100: '#CCFBF1', // Subtle active highlights
    50:  '#F0FDFA', // Lightest active row tint
  },

  // AI & Clinical Copilot (Mint / Emerald Family - NO PURPLE)
  ai: {
    primary: '#059669', // AI Accent / Pulse
    surface: '#E6F4F1', // AI Response Block Surface
    border:  '#A7F3D0', // AI Container Border
    text:    '#047857', // AI Label & Attribution text
    hover:   '#D1FAE5', // AI Interactive Pill Hover
  },

  // Surfaces (Canonical Light Mode & Dark Mode Fallback)
  surface: {
    app:         '#FAF9F6', // Canonical Warm Off-White Page Background
    base:        '#FFFFFF', // Primary Card & Modal Surface
    subtle:      '#F3F4F1', // Secondary container / table header
    interactive: '#F8FAFC', // Clickable row / list item
    darkApp:     '#0C1117', // Dark Mode Page Background
    darkBase:    '#161B22', // Dark Mode Primary Surface
    darkSubtle:  '#1F242C', // Dark Mode Secondary Surface
  },

  // Typography Colors
  text: {
    main:    '#0F172A', // Primary body & headings
    muted:   '#475569', // Subtitles & secondary labels
    subtle:  '#64748B', // Metadata & disabled state
    inverse: '#FFFFFF', // Text on primary teal button
  },

  // Borders
  border: {
    subtle: '#E5E7EB', // Card borders & hairline dividers
    strong: '#D1D5DB', // Input borders & focus boundaries
    dark:   '#21262D', // Dark mode borders
  },

  // Semantic Status (Multi-Modal: Color + Icon + Plain Text)
  semantic: {
    healthy: {
      text:    '#047857',
      bg:      '#ECFDF5',
      border:  '#A7F3D0',
      icon:    '#059669',
    },
    attention: {
      text:    '#B45309',
      bg:      '#FFFBEB',
      border:  '#FDE68A',
      icon:    '#D97706',
    },
    critical: {
      text:    '#B91C1C',
      bg:      '#FEF2F2',
      border:  '#FCA5A5',
      icon:    '#DC2626',
    },
    info: {
      text:    '#0F766E',
      bg:      '#F0FDFA',
      border:  '#CCFBF1',
      icon:    '#0F766E',
    },
  },
} as const;

export type ColorTokens = typeof colors;
