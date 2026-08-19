/**
 * HealthSphere Design System v1.1.0 - Border Radius Tokens
 * Controlled radius scale prohibiting excessive rounded containers
 */

export const radii = {
  sm:   '6px',    // Small tags, inline chips, tooltips
  md:   '10px',   // Buttons, form inputs, dropdown menus
  lg:   '16px',   // Cards, dialog modals, drawer panels
  pill: '9999px', // Status badges, filter pills, avatar rings
} as const;

export type RadiiTokens = typeof radii;
