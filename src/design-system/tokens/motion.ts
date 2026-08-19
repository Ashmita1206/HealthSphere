/**
 * HealthSphere Design System v2.0.0 — Motion Language Architecture
 * ─────────────────────────────────────────────────────────────────
 * Principle: CALM + ALIVE.
 * Every motion must have PURPOSE, DURATION, EASING, DISTANCE, and OPACITY BEHAVIOR.
 * Honors prefers-reduced-motion via framer-motion's built-in support.
 *
 * Timing philosophy:
 *   Micro (80–120ms)  → Button press, checkbox, toggle
 *   Fast  (150–200ms) → Hover states, tab switches, indicator slides
 *   Normal(220–300ms) → Content reveals, section entrances, drawer slides
 *   Slow  (350–500ms) → Page transitions, chart draws, large surface changes
 */

/* ── Duration Tokens ──────────────────────────────────────────── */

export const duration = {
  micro:  0.1,   // 100ms — Immediate tactile feedback
  fast:   0.18,  // 180ms — Hover, focus, indicator movement
  normal: 0.25,  // 250ms — Content reveal, drawer entrance
  slow:   0.4,   // 400ms — Page transition, large reveals
  draw:   0.8,   // 800ms — Chart line draw, timeline build
  count:  1.2,   // 1200ms — Number count-up animation
} as const;

/* ── Easing Curves ────────────────────────────────────────────── */

export const easing = {
  /** Smooth deceleration — primary exit curve */
  out:        [0.16, 1, 0.3, 1] as const,
  /** Smooth acceleration+deceleration — symmetric movement */
  inOut:      [0.4, 0, 0.2, 1] as const,
  /** Gentle spring snap — checkmarks, completions */
  bounce:     [0.34, 1.56, 0.64, 1] as const,
  /** Quick start, slow settle — metric establishment */
  establish:  [0.25, 0.46, 0.45, 0.94] as const,
  /** Linear for progress/loading */
  linear:     [0, 0, 1, 1] as const,
} as const;

/* ── Spring Configurations ────────────────────────────────────── */

export const spring = {
  /** Snappy indicator movement (sidebar active pill) */
  snappy:   { type: 'spring' as const, stiffness: 400, damping: 30 },
  /** Gentle settle (drawer, modal) */
  gentle:   { type: 'spring' as const, stiffness: 300, damping: 28 },
  /** Bouncy completion (checkmark, success) */
  bouncy:   { type: 'spring' as const, stiffness: 500, damping: 15 },
  /** Smooth physical (collapse/expand) */
  physical: { type: 'spring' as const, stiffness: 250, damping: 25 },
} as const;

/* ── Backward-compatible export ───────────────────────────────── */

export const motionTokens = { duration, easing } as const;

/* ══════════════════════════════════════════════════════════════════
   NAMED MOTION VARIANTS
   Each variant is a framer-motion variant object with
   hidden → visible (and sometimes exit) states.
   ══════════════════════════════════════════════════════════════════ */

export const motionVariants = {

  /* ── Page-level ─────────────────────────────────────────────── */

  /** Full page entrance: fade up from below */
  pageEnter: {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: duration.slow, ease: easing.out },
    },
    exit: {
      opacity: 0,
      y: -8,
      transition: { duration: duration.fast },
    },
  },

  /* ── Container orchestration ────────────────────────────────── */

  /** Stagger children sequentially */
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  },

  /** Faster stagger for dense lists */
  staggerFast: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.02,
      },
    },
  },

  /* ── Content reveals ────────────────────────────────────────── */

  /** Standard content block reveal: fade + rise */
  contentReveal: {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: duration.normal, ease: easing.out },
    },
  },

  /** Larger section entrance: more distance, slower */
  sectionReveal: {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: duration.slow, ease: easing.out },
    },
  },

  /* ── Metric & Data ──────────────────────────────────────────── */

  /** Health score / metric number establishment: scale + fade */
  metricEstablish: {
    hidden: { opacity: 0, scale: 0.9, y: 4 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: duration.slow, ease: easing.establish },
    },
  },

  /** Chart line draw: for SVG pathLength animations */
  chartDraw: {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: duration.draw, ease: easing.inOut },
    },
  },

  /** Timeline item sequential reveal */
  timelineReveal: {
    hidden: { opacity: 0, x: -12 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: duration.normal, ease: easing.out },
    },
  },

  /** Filter/tab data cross-fade transition */
  filterTransition: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: duration.fast, ease: easing.inOut },
    },
    exit: {
      opacity: 0,
      transition: { duration: duration.micro },
    },
  },

  /* ── Interactive feedback ───────────────────────────────────── */

  /** Surface hover lift with shadow */
  hoverLift: {
    rest: {
      y: 0,
      boxShadow: '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
    },
    hover: {
      y: -3,
      boxShadow: '0 8px 20px -4px rgba(15, 23, 42, 0.08), 0 2px 6px -2px rgba(15, 23, 42, 0.04)',
      transition: { duration: duration.fast, ease: easing.out },
    },
  },

  /** Button press with spring recovery */
  buttonPress: {
    rest: { scale: 1 },
    pressed: {
      scale: 0.97,
      transition: { duration: duration.micro, ease: easing.out },
    },
  },

  /** Completion checkmark: scale bounce in */
  completionCheck: {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: spring.bouncy,
    },
  },

  /** Success confirmation: brief green flash + settle */
  successConfirmation: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: duration.normal, ease: easing.bounce },
    },
  },

  /* ── Navigation ─────────────────────────────────────────────── */

  /** Sidebar active indicator slide (used with layoutId) */
  navIndicatorSlide: {
    layout: true,
    transition: spring.snappy,
  },

  /* ── Drawers & Overlays ─────────────────────────────────────── */

  /** Mobile drawer entrance from left */
  drawerEnter: {
    hidden: { x: '-100%' },
    visible: {
      x: 0,
      transition: spring.gentle,
    },
    exit: {
      x: '-100%',
      transition: { duration: duration.normal, ease: easing.inOut },
    },
  },

  /** Drawer backdrop fade */
  drawerBackdrop: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: duration.normal, ease: easing.out },
    },
    exit: {
      opacity: 0,
      transition: { duration: duration.fast },
    },
  },

  /* ── AI-specific ────────────────────────────────────────────── */

  /** AI context panel entrance: slide from right + fade */
  aiContextEnter: {
    hidden: { opacity: 0, x: 16 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: duration.normal, ease: easing.out },
    },
  },

  /** AI streaming text pulse */
  aiStream: {
    hidden: { opacity: 0.4 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        repeat: Infinity,
        repeatType: 'reverse' as const,
        ease: easing.linear,
      },
    },
  },
} as const;
