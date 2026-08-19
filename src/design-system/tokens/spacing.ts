/**
 * HealthSphere Design System v1.1.0 - Spacing Tokens
 * Strict 4px Rhythm Scale & Content Density System
 */

export const spacing = {
  // Base 4px Grid Tokens
  scale: {
    1:  '4px',   // 0.25rem - Micro gap / badge padding
    2:  '8px',   // 0.50rem - Compact gap / input vertical pad
    3:  '12px',  // 0.75rem - List item gap / component spacing
    4:  '16px',  // 1.00rem - Standard padding / form gap
    6:  '24px',  // 1.50rem - Section gap / card desktop padding
    8:  '32px',  // 2.00rem - Major section margin
    12: '48px',  // 3.00rem - Hero padding / empty state spacing
    16: '64px',  // 4.00rem - Page container bottom pad
  },

  // Content Density Modes
  density: {
    relaxed: {
      padding: '24px',
      gap: '20px',
      fontSize: '16px',
      usage: 'AI Health Assistant chat, initial onboarding, narrative reading',
    },
    standard: {
      padding: '16px',
      gap: '16px',
      fontSize: '14px',
      usage: 'Main Dashboard, Appointments, Medicines list, Profile views',
    },
    dense: {
      padding: '8px',
      gap: '8px',
      fontSize: '12px',
      usage: 'Clinical lab report parameter extraction tables, vitals log',
    },
  },
} as const;

export type SpacingTokens = typeof spacing;
