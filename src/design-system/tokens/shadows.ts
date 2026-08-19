/**
 * HealthSphere Design System v1.1.0 - Elevation & Shadow Tokens
 * Subtle ambient shadows only. Zero dark heavy black shadows or glowing neon drop shadows.
 */

export const shadows = {
  none:  'none',
  sm:    '0 1px 2px 0 rgba(15, 23, 42, 0.04)',                      // Card default
  md:    '0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.03)', // Dropdowns, active card hover
  lg:    '0 10px 15px -3px rgba(15, 23, 42, 0.06), 0 4px 6px -4px rgba(15, 23, 42, 0.02)', // Modals & drawers
  focusRing: '0 0 0 2px #FAF9F6, 0 0 0 4px #0F766E',               // Accessible double focus ring
} as const;

export type ShadowTokens = typeof shadows;
