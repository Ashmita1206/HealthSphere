# HEALTHSPHERE PRODUCT DESIGN SYSTEM SPECIFICATION
**Version:** 1.1.0  
**Status:** Definitive Architecture & Interaction Contract  
**Product Vision:** Your Intelligent Personal Health Operating System  
**Design Philosophy:** Apple-level restraint applied to clinical digital health  

---

## SECTION 1 — BRAND STRATEGY & DESIGN RATIONALE

### 1.1 Brand Personality & Core Attributes
HealthSphere is an intelligent personal health operating system. It bridges the gap between complex medical telemetry and intuitive human agency.

| Attribute | Meaning in Experience | Counter-Pattern (What to Avoid) |
|---|---|---|
| **CALM** | Generous whitespace, warm off-white surfaces (`#FAF9F6`), unhurried typography. | Saturated neon banners, frantic red default badges, dense widget grids. |
| **CLINICAL** | Precision typography, structured lab telemetry, transparent evidence context. | Casual fitness slang ("Crushing it!"), gamified streaks, arbitrary score meters. |
| **HUMAN** | Empathetic tone ("Good morning, Alex"), conversational clarity, narrative flow. | Cold clinical admin jargon ("Patient ID #4829 Overview"), robotic data tables. |
| **INTELLIGENT** | Structured evidence blocks, clear clinical context, transparent reasoning. | Gimmicky "magic AI" sparkles, purple glowing orbs, decorative floating bots. |
| **PREMIUM** | Pristine visual restraint, deliberate micro-interactions, editorial grid balance. | Over-rounded borders, drop-shadow soup, generic component library clones. |
| **EDITORIAL** | Clear narrative hierarchy, magazine-like typography contrast, story-driven pages. | 12 identical cards dropped into a 3x4 CSS grid. |

### 1.2 Product vs. Marketing Separation Rationale
* **Decision**: HealthSphere maintains a strict visual boundary between the public marketing site and the authenticated product application.
* **Why**: Marketing sites use expressive visuals to capture interest. Authenticated health applications must prioritize low cognitive load, fast scannability, clinical safety, and trust.
* **Problem Solved**: Eliminates marketing decoration (hero gradients, floating background glass blobs, massive marketing headers) from polluting clinical workflows.
* **Implementation Rule**: Authenticated product pages MUST use neutral backgrounds (`#FAF9F6` light / `#0C1117` dark), crisp 1px borders, and flat surface layers.
* **Anti-Pattern**: Importing landing page glassmorphism, animated gradient text, or decorative background mesh into the dashboard or AI workspace.

---

## SECTION 2 — TYPOGRAPHY ARCHITECTURE

### 2.1 Primary & Secondary Typeface Selection
* **Primary UI Typeface**: **Plus Jakarta Sans**
  * *Why*: Plus Jakarta Sans provides modern geometric precision paired with warm, human humanist curve terminals. Unlike Inter (which has become the ubiquitous generic SaaS default), Plus Jakarta Sans gives HealthSphere an immediate, distinctive, premium brand personality while maintaining exceptional legibility at small UI scale (11px–14px).
  * *Implementation*: Loaded via Google Fonts (`weights: 400, 500, 600, 700`).
* **Secondary Editorial Display Typeface**: **Instrument Serif** (or Georgia fallback)
  * *Where It MAY Be Used*: Signature narrative greetings (e.g., "Good morning, Alex" in `HealthSnapshot`), high-level health narrative blockquotes.
  * *Where It MUST NOT Be Used*: Interactive UI controls, buttons, form labels, data tables, metrics, navigation, or AI response copy.
* **Data / Numeric Font**: **Plus Jakarta Sans** with enabled tabular figures (`font-variant-numeric: tabular-nums, lining-nums`).

### 2.2 Typography Scale Matrix
| Token | Size | Weight | Line Height | Letter Spacing | Clinical & UI Purpose |
|---|---|---|---|---|---|
| `font-display` | 36px (2.25rem) | 700 (Bold) | 1.15 (41px) | -0.025em | Signature Patient Greeting (Editorial accent allowed) |
| `font-h1` | 28px (1.75rem) | 700 (Bold) | 1.25 (35px) | -0.020em | Main Page Level Heading |
| `font-h2` | 22px (1.375rem)| 600 (SemiBold)| 1.30 (28px) | -0.015em | Section Titles, Workspace Headers |
| `font-h3` | 18px (1.125rem)| 600 (SemiBold)| 1.35 (24px) | -0.010em | Card Titles, Drawer Section Headers |
| `font-body-lg` | 16px (1.000rem)| 400 (Regular) | 1.60 (26px) | 0.000em | AI Clinical Response Copy, Report Interpretations |
| `font-body-md` | 14px (0.875rem)| 400 (Regular) | 1.50 (21px) | 0.000em | Standard Interface Copy, List Items |
| `font-caption` | 12px (0.750rem)| 500 (Medium)  | 1.40 (17px) | +0.010em | Timestamps, Secondary Metadata, Helper Text |
| `font-label` | 11px (0.6875rem)|600 (SemiBold)| 1.30 (14px) | +0.050em (UPPER)| Section Category Overlines, Status Badges |
| `font-metric-xl`| 44px (2.750rem)| 700 (Bold) | 1.00 (44px) | -0.030em | Health Score Primary Number, Vital Standout |
| `font-metric-lg`| 28px (1.750rem)| 700 (Bold) | 1.10 (31px) | -0.020em | Lab Test Parameter Numeric Values |

---

## SECTION 3 — COLOR ARCHITECTURE & ACCENT BUDGET

### 3.1 Absolute Color Rules
* **ABSOLUTE RULE**: **NO BLUE (#0000FF, #3B82F6, #1E40AF, etc.) or PURPLE (#8B5CF6, #6D28D9, etc.)** in brand elements, AI identity, primary CTAs, active states, charts, backgrounds, or decorative accents.
* **Canonical Theme**: Light mode (`#FAF9F6`) is the primary, canonical HealthSphere experience. Dark mode is a supported secondary accessibility theme.
* **Teal Governance**: Developers are forbidden from selecting arbitrary inline teal hex values. Only defined design system tokens are permitted.

### 3.2 Accent & Saturation Budget (The 80-15-5 Rule)
Rather than a generic 60-30-10 rule, HealthSphere enforces a strict clinical saturation budget per viewport:
* **80% Neutral & Surface Foundation**: Background `#FAF9F6`, Cards `#FFFFFF`, Borders `#E5E7EB`.
* **15% High-Legibility Slate Ink**: Headings `#0F172A`, Body Copy `#334155`, Muted Labels `#64748B`.
* **5% Semantic Accent Budget**: Primary Teal `#0F766E`, Mint AI Accent `#059669`, Amber `#D97706`, Crimson `#DC2626`.
* *Rule*: No more than **3 semantic accent elements** may compete for visual attention in a single screen section.

### 3.3 Complete Token Dictionary

#### Brand & Primary Palette
| Token Name | Hex Code | Purpose & Usage | Prohibited Usage |
|---|---|---|---|
| `color-primary-950` | `#042F2C` | Deepest brand ink, dark mode primary headers | Standard body copy, page backgrounds |
| `color-primary-900` | `#0D4B46` | High-contrast clinical titles | Card container backgrounds |
| `color-primary-800` | `#0F766E` | **Primary Brand Color**: Main buttons, active nav pill | Paragraph body text |
| `color-primary-700` | `#115E59` | Hover state for primary buttons | Disabled button state |
| `color-primary-600` | `#14B8A6` | Active focus ring, subtle interactive borders | Main button background fill |
| `color-primary-100` | `#CCFBF1` | Active item background, tag highlights | Primary CTA background |
| `color-primary-50` | `#F0FDFA` | Lightest tint for active selected rows | Text color |

#### AI & Intelligence Palette (Mint / Emerald Family)
| Token Name | Hex Code | Purpose & Usage | Prohibited Usage |
|---|---|---|---|
| `color-ai-primary` | `#059669` | **AI Identity Accent**: AI status indicators, evidence pills | Brand logo |
| `color-ai-surface` | `#E6F4F1` | **AI Response Block Surface**: Background for AI answers | Default page background |
| `color-ai-border` | `#A7F3D0` | Hairline border for AI insight containers | Body divider rules |
| `color-ai-text` | `#047857` | AI category label text, evidence badge text | Secondary body copy |

#### Surface Palette (Light & Dark)
| Token Name | Light Hex | Dark Hex | Purpose & Usage |
|---|---|---|---|
| `color-bg-app` | `#FAF9F6` | `#0C1117` | Canonical page viewport background |
| `color-surface-base` | `#FFFFFF` | `#161B22` | Primary content card surface |
| `color-surface-subtle`| `#F3F4F1` | `#1F242C` | Muted inner container, code/table header |
| `color-border-subtle` | `#E5E7EB` | `#21262D` | Hairline section dividers, card borders |
| `color-border-strong` | `#D1D5DB` | `#30363D` | Interactive input borders, focus outlines |
| `color-text-main` | `#0F172A` | `#F0F6FC` | Primary body text, high-hierarchy headings |
| `color-text-muted` | `#475569` | `#8B949E` | Secondary metadata, labels, subtitles |

#### Semantic Status Palette
| Token Name | Text Hex | Surface Hex | Icon / Border | Purpose |
|---|---|---|---|---|
| `status-healthy` | `#047857` | `#ECFDF5` | CheckCircle2 (`#059669`) | Normal lab values, optimal score, stable trends |
| `status-attention`| `#B45309` | `#FFFBEB` | AlertTriangle (`#D97706`) | Lab value near threshold, upcoming refill, due dose |
| `status-critical` | `#B91C1C` | `#FEF2F2` | AlertCircle (`#DC2626`) | **True Urgency Only**: Abnormal critical lab, emergency |
| `status-info` | `#0F766E` | `#F0FDFA` | Info (`#0F766E`) | Informational updates, system notices |

---

## SECTION 4 — CONTENT DENSITY SYSTEM

HealthSphere adapts interface density to the patient's cognitive task:

| Density Level | Vertical Padding | Row Height | Font Size | Appropriate Domain Application |
|---|---|---|---|---|
| **Relaxed** | `24px` (`p-6`) | Flexible | `16px` (`font-body-lg`) | AI Health Assistant chat, initial health onboarding, narrative reading |
| **Standard** | `16px` (`p-4`) | `48px` | `14px` (`font-body-md`) | Main Dashboard, Appointments, Medicines list, Profile views |
| **Dense** | `8px` (`p-2`) | `36px` | `12px/14px` | Clinical lab report extractions, detailed vitals log tables |

---

## SECTION 5 — SPACING & GRID ARCHITECTURE

### 5.1 Base 4px Rhythm Tokens
Arbitrary values (`mt-[13px]`) are strictly forbidden. Use defined tokens:
`space-1` (4px), `space-2` (8px), `space-3` (12px), `space-4` (16px), `space-6` (24px), `space-8` (32px), `space-12` (48px), `space-16` (64px).

### 5.2 Responsive Layout Boundaries
* **Max Content Width**: `1360px` (`max-w-7xl`).
* **Sidebar Width**: `256px` (`w-64`) expanded; `72px` (`w-18`) collapsed.
* **Navbar Height**: `64px` (`h-16`).

---

## SECTION 6 — SURFACES, RADIUS & ELEVATION

### 6.1 Radius System
* `radius-sm`: `6px` (Badges, inline pills, code chips).
* `radius-md`: `10px` (Buttons, form inputs, dropdown menus).
* `radius-lg`: `16px` (Cards, dialog modals, drawer panels).
* `radius-pill`: `9999px` (Status badges, avatar rings, filter toggles).

### 6.2 Elevation & Shadow Philosophy
* **NO heavy dark drop shadows** or glowing neon drop shadows.
* `shadow-sm`: `0 1px 2px 0 rgba(15, 23, 42, 0.04)` (Card default).
* `shadow-md`: `0 4px 6px -1px rgba(15, 23, 42, 0.05)` (Dropdowns, active card hover).
* `shadow-lg`: `0 10px 15px -3px rgba(15, 23, 42, 0.06)` (Modals, drawers).
* `focus-ring`: `0 0 0 2px #FAF9F6, 0 0 0 4px #0F766E` (Keyboard focus).

---

## SECTION 7 — ICONOGRAPHY SYSTEM

* **Library**: `lucide-react` exclusively.
* **Default Size**: `18px` (`w-4.5 h-4.5` or `w-4 h-4` for inline text).
* **Stroke Width**: `1.75px` uniform.
* **Prohibition**: Decorative icon containers (e.g. putting every text title inside a colored rounded square with an icon) are banned. Icons appear ONLY when adding scanning value or interactive affordance.

---

## SECTION 8 — PRIMITIVE COMPONENT ARCHITECTURE

### 8.1 Button System Matrix
* **Primary Button**: Background `#0F766E`, text `#FFFFFF`, radius `10px`. Hover `#115E59`. Active scale `0.98`.
* **Secondary Button**: Background `#FFFFFF`, border `1px solid #D1D5DB`, text `#0F172A`. Hover `#F8FAFC`.
* **Ghost Button**: Background transparent, text `#475569`. Hover `#F3F4F1`, text `#0F172A`.
* **Danger Button**: Background `#DC2626`, text `#FFFFFF`. Hover `#B91C1C`.

### 8.2 Form System & Inputs
* Always visible labels (`font-body-md`, SemiBold, `#0F172A`). Placeholder-only labels are prohibited.
* Input Height `40px` (`h-10`), background `#FFFFFF`, border `1px solid #D1D5DB`, focus ring `0 0 0 4px #0F766E`.

---

## SECTION 9 — SIGNATURE HEALTHSPHERE COMPONENTS

These signature patterns define HealthSphere's visual vocabulary:

### 9.1 `HealthSnapshot`
* **Purpose**: Patient's top-level daily health narrative.
* **Hierarchy**: Greeting → Overall Status Tag → Narrative Summary → 1 Key Metric Standout.
* **Visual Behavior**: Flat warm surface (`#FFFFFF`), subtle hairline border (`#E5E7EB`), generous padding (`24px`). Features Optional Instrument Serif display font accent on the greeting.
* **Anti-Pattern**: Saturated gradient background, floating 3D graphic.

### 9.2 `HealthSignal`
* **Purpose**: Compact indicator showing a single vital parameter state (e.g. Blood Pressure, Heart Rate).
* **Hierarchy**: Parameter Name → Value + Unit → Trend Arrow Tag.
* **Visual Behavior**: Numeric value in `font-metric-lg` (`28px`, tabular figures). Status border tint (Green for stable, Amber for attention).

### 9.3 `ClinicalInsight`
* **Purpose**: Highlights a single synthesized clinical finding.
* **Hierarchy**: Category Tag → Key Insight Sentence → Evidence Trigger ("Based on Aug 4 Lab Report").
* **Visual Behavior**: Soft Mint surface (`#E6F4F1`), border `#A7F3D0`, text `#047857`.

### 9.4 `CareAction`
* **Purpose**: Time-critical daily task (Medication dose, Appointment preparation).
* **Hierarchy**: Checkbox Affordance → Task Title → Timing Badge ("8:00 AM") → Context Note.
* **Visual Behavior**: Interactive surface row (`#FFFFFF`), subtle hover transition, active checked state dims row to muted slate.

### 9.5 `HealthTimeline`
* **Purpose**: Chronological patient health story.
* **Hierarchy**: Date Anchor → Event Node Icon → Event Title → Clinical Category → Attachment Link.
* **Visual Behavior**: Left vertical guide line (`#E5E7EB`), clean node pins.

### 9.6 `ReportFinding`
* **Purpose**: Structured display of extracted lab parameters.
* **Hierarchy**: Lab Test Name → Extracted Value + Unit → Reference Range → Status Tag.
* **Visual Behavior**: Dense layout mode (`8px` vertical padding), high contrast on out-of-range values (Crimson tag).

### 9.7 `AIContextHeader`
* **Purpose**: Displays active health context attached to an AI conversation.
* **Hierarchy**: Linked Record Badge ("Context: Blood Test Aug 4, 2026") → Clear Context Button.
* **Visual Behavior**: Top-pinned pill bar inSoft Mint (`#E6F4F1`).

### 9.8 `HealthScoreBreakdown`
* **Purpose**: Category-by-category breakdown of patient health standing (Lifestyle, Sleep, Adherence, Recovery).
* **Hierarchy**: Overall Score Hero Number → 4 Category Progress Bars → Impact Factor Notes.
* **Visual Behavior**: Clean tabular metrics, restrained monochrome or teal progress bars. No gamified star ratings.

---

## SECTION 10 — CLINICAL AI DESIGN SYSTEM

### 10.1 Evidence & Context Model (Replacing Fake Confidence Percentages)
* **Rule**: Arbitrary LLM confidence percentages (e.g., "94% confident") MUST NOT be shown to patients.
* **Replacement**: HealthSphere displays **Evidence Level** and **Source Attribution**:
  * `Verified Lab Baseline` (Extracted from uploaded medical OCR reports).
  * `Contextual Vitals` (Derived from active health telemetry logs).
  * `User Self-Report` (Derived from conversation input).

### 10.2 Flexible AI Response Composition System
AI responses are built dynamically using these reusable primitives:

```
┌────────────────────────────────────────────────────────┐
│ ✦ HealthSphere Intelligence                           │  <-- Header (#E6F4F1)
├────────────────────────────────────────────────────────┤
│ [Primitive: Answer]                                    │
│ Your fasting glucose level of 98 mg/dL is within the   │
│ normal healthy range.                                  │
│                                                        │
│ [Primitive: Evidence]                                  │
│ 📋 Source: Lab Report (Aug 4, 2026) | Reference: <100  │
│                                                        │
│ [Primitive: Recommendation]                            │
│ Continue your current dietary schedule and repeat routine│
│ lab testing in 6 months.                               │
│                                                        │
│ [Primitive: Warning] (Only if applicable)              │
│ ⚠️ Note: If you experience symptoms of hypoglycemia... │
└────────────────────────────────────────────────────────┘
```

### 10.3 Complete AI Conversation UX States
1. **User Message**: Right-aligned or clean left-indented block, neutral surface (`#F3F4F1`), ink text.
2. **AI Message**: Soft Mint surface (`#E6F4F1`), hairline border (`#A7F3D0`), ink text, `1.6` line-height.
3. **Streaming State**: Left vertical emerald pulse bar (`#059669`), inline streaming text. No spinning sparkles.
4. **Context Header**: Sticky top bar showing attached reports/vitals.
5. **Suggested Prompts**: Horizontal pill group in `#FFFFFF` with `#0F766E` text and hover tint.
6. **Failed Response / Retry State**: Muted error card with "Re-generate response" secondary button and inline error summary.

---

## SECTION 11 — NAVIGATION SYSTEM ARCHITECTURE

### 11.1 Sidebar Navigation Groups
The sidebar is structured into 4 quiet, architectural groups:
* **CARE**: Dashboard (`/dashboard`), Appointments (`/appointments`), Medicines (`/medicines`), Reports (`/reports`), Timeline (`/timeline`).
* **INTELLIGENCE**: AI Assistant (`/ai-chat`), AI Vision (`/ai-vision`), Health Score (`/ai-health-score`).
* **SUPPORT**: Emergency (`/emergency`), Blood & Organ (`/blood-organ`).
* **PERSONAL**: Profile (`/profile`), Settings (`/settings`).

### 11.2 Detailed Navigation Component States
* **Expanded State**: Width `256px` (`w-64`), displaying group titles in `font-label` uppercase slate.
* **Collapsed State**: Width `72px` (`w-18`), displaying icons only with native tooltip on hover.
* **Active State**: Pill background `#0F766E` (Deep Teal), text `#FFFFFF`, icon `#FFFFFF`.
* **Hover State**: Background `#F0FDFA`, text `#0F766E`.
* **Keyboard Focus State**: Visible focus ring (`0 0 0 4px #0F766E`).
* **Unread / Notification Badge**: Muted teal or amber pill (e.g. `2` or `Refill`).
* **Mobile Drawer**: Sliding panel from left (`280px` width) with backdrop dimming overlay (`bg-slate-900/50`).

---

## SECTION 12 — NARRATIVE DASHBOARD HIERARCHY

The HealthSphere Dashboard follows a signature 5-step narrative stream:

1. **How am I doing?** (`HealthSnapshot`: Overall standing + narrative greeting).
2. **What needs attention?** (`ClinicalInsight` or warning alert if an abnormal lab/vital exists).
3. **What do I need to do today?** (`CareAction`: Due medications + upcoming appointments).
4. **What changed?** (`HealthTrendChart`: Vitals trends over time).
5. **What should I understand next?** (`AI Assistant` contextual prompt suggestion).

---

## SECTION 13 — DATA VISUALIZATION SPECIFICATION

### 13.1 Chart Rules & Color Palette
* **Allowed Chart Line 1**: `#0F766E` (Deep Teal), stroke width `2.5px`.
* **Allowed Chart Line 2**: `#059669` (Clinical Emerald).
* **Reference Target Range Fill**: `#F0FDFA` with dashed boundary line (`#14B8A6`).
* **Outlier / Abnormal Point**: Crimson dot (`#DC2626`).
* **Prohibited**: NO rainbow charts, NO blue or purple lines, NO 3D bar graphs, NO decorative background grid clutter.

### 13.2 Chart Matrix Usage
| Chart Type | Primary Purpose | Prohibited Usage |
|---|---|---|
| **Line Chart** | Continuous vitals tracking (Heart rate, Glucose, Weight over 30 days) | Categorical single-point data |
| **Bar Chart** | Discrete daily counts (Medication adherence days per week, Hydration glasses) | Continuous high-frequency telemetry |
| **Sparkline** | Compact inline trends inside stat cards | Detailed analysis requiring numeric axis values |
| **Area Chart** | Telemetry with explicit upper/lower normal reference range bands | Multi-series overlapping datasets |

---

## SECTION 14 — EMERGENCY UX PHILOSOPHY

* **Philosophy**: Low cognitive load, immediate clarity, calm urgency.
* **Visual Treatment**: Crimson (`#DC2626`) is strictly reserved for actual emergency actions.
* **Layout**: Large, clear action tiles (1-Tap Speed Dial, Nearest ER Route Map, Emergency Profile ID).
* **No Decoration**: Zero decorative animations, zero playful icons. High-contrast typography and clear touch targets (`56px` height minimum).

---

## SECTION 15 — SYSTEM STATES ARCHITECTURE

### 15.1 Empty States Architecture
Every empty state MUST contain:
1. **Contextual Title**: Clear explanation of state (e.g. "No Medical Reports Uploaded").
2. **Supporting Body Copy**: Explains benefit ("Upload your blood test or lab report to receive AI insights and track biomarkers over time.").
3. **Primary Action Button**: "Upload Medical Report".
4. **Prohibition**: Decorative abstract illustrations are banned. Use simple Lucide icon in subtle slate ring.

### 15.2 Loading States
* **Skeleton Loaders**: Layout-preserving grey blocks (`#F1F5F9`) with smooth opacity pulse. Skeletons must match exact card dimensions to eliminate layout shifts (CLS).
* **AI Streaming Loading**: Left pulse bar in Emerald (`#059669`).
* **OCR Report Processing**: Progress bar with explicit status text ("Extracting biomarker values...").

### 15.3 Error States (The 3-Part Error Contract)
Every error component must clearly state:
1. **What happened**: "We couldn't process this PDF document."
2. **Why / Context**: "The file format or resolution was not readable."
3. **Recovery Action**: Button: "Try uploading a clearer JPG or PNG photo".

---

## SECTION 16 — DESIGN ANTI-PATTERNS BLACKLIST

| Anti-Pattern | Why It Is Strictly Prohibited in HealthSphere |
|---|---|
| **Blue/Purple SaaS Fills & Gradients** | Destroys clinical brand recognition and looks like a generic crypto template. |
| **Glowing AI Orbs & Sparkles** | Communicates "toy AI magic" rather than serious medical data synthesis. |
| **Arbitrary LLM Confidence Scores (e.g. 94%)** | Misleads patients with fake mathematical certainty. |
| **Dense Card Grids (12 identical cards)** | Causes visual overwhelm. Patients cannot discern health priorities. |
| **Gradient Text & Gradient Buttons** | Decreases contrast and looks visually cheap. |
| **Decorative Floating Glass Blobs** | Creates unnecessary GPU render load and visual clutter. |
| **Gamified Health Badges & Streaks** | Trivializes clinical healthcare. |

---

## SECTION 17 — DESIGN DECISION RATIONALE MATRIX

| Decision | Why | Problem Solved | Implementation Rule | Anti-Pattern |
|---|---|---|---|---|
| **Plus Jakarta Sans as UI Font** | Distinctive geometric warmth | Generic SaaS appearance from Inter | Use `font-sans` everywhere | Mixing 3 different font families |
| **Mint Tint (#E6F4F1) for AI** | Calming clinical copilot identity | Purple "magic chatbot" trend | Apply to AI cards & responses | Using purple or blue AI tags |
| **Narrative Dashboard Stream** | Guides patient through priorities | Dashboard grid cognitive overload | Sequence in 5-step narrative | 12 equal-sized grid cards |
| **Evidence Model for AI** | Medical accuracy & patient safety | Deceptive confidence percentages | Display source & evidence type | Exposing "94% LLM Confidence" |
| **Crimson Only for Emergency** | Preserves high alert signal strength | Desensitized warning fatigue | Reserve `#DC2626` for true danger | Using red buttons for normal actions |

---

## SECTION 18 — DESIGN SYSTEM NON-NEGOTIABLES

Developers and AI agents implementing HealthSphere MUST comply with these non-negotiable contract rules:

1. **NO BLUE OR PURPLE**: Never introduce blue (`#3B82F6`) or purple (`#8B5CF6`) colors, gradients, or AI accents into the codebase.
2. **NO ARBITRARY TOKENS**: Never write inline hex colors or custom Tailwind margins (`mt-[13px]`). Always use design system tokens from `src/design-system/tokens/`.
3. **LIGHT MODE IS CANONICAL**: Build and verify all screens in Light Mode (`#FAF9F6`) first before checking dark mode.
4. **LAYOUT PRESERVATION**: Always preserve layout boundaries during loading states using matching skeletons.
5. **ACCESSIBILITY FIRST**: Never use color as the sole indicator of status. Pair color with a distinct icon and explicit text.
6. **NO MARKETING DECORATION IN PRODUCT**: Keep authenticated dashboard pages quiet, architectural, and content-focused.
