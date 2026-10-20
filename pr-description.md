## Overview
This PR consolidates the HealthSphere repository by eliminating redundant frontend contexts, obsolete UI components, and duplicate chat backend routes, while hardening critical chat socket authorization and emergency delivery semantics.

## Summary of Changes

### 1. Codebase Deduplication & Hygiene
- **Canonical Contexts**: Unified state management under `src/context/` and removed legacy duplicate implementations in `src/contexts/`.
- **Backend Chat Consolidation**: Standardized on `server/routes/chatRoutes.js` and `server/controllers/chatController.js`. Removed legacy `chat.Routes.js` and `chat.controller.js`.
- **Obsolete Components**: Removed unused starter pages (`Index.tsx`) and deprecated UI stubs (`DashboardCard`, `FeatureCard`, `GlassCard`, `NavLink`).
- **Package Manager Consistency**: Removed duplicate `bun.lockb` to maintain `package-lock.json` as the single canonical lockfile.

### 2. Chat Authorization Security (Critical)
- **Socket Identity Invariant**: Socket operations extract user identity exclusively from the server-verified JWT (`socket.user.id`).
- **Spoofing Prevention**: Client-supplied `userId` in `START_CONVERSATION` is ignored.
- **Participant Authorization**: Enforced ownership check (`String(conversation.user) === String(authenticatedUserId)`) before loading history, accepting messages, or terminating a conversation.
- **Enumeration Defense**: Unauthorized access attempts return a generic `"Conversation not found."` error.

### 3. SOS / Emergency Delivery Honesty
- **Delivery Acknowledgement**: Set `contactAlerted: false` upon database persistence to avoid implying external responder dispatch.
- **Honest Guidance**: Updated response message and UI to clearly distinguish database persistence from actual 911/responder dispatch, directing patients to contact emergency services (911/112) directly.
- **GPS Safety**: Enforced strict number validation on coordinates; missing GPS is never replaced with fabricated `(0, 0)` coordinates.
- **Duplicate Prevention**: Protected against rapid duplicate clicks via UI state locks and MongoDB active-alert upsert.

### 4. Regression & Security Test Suites
- Added `chatAuthorizationSecurity.test.ts` (21 tests).
- Added `profileRoleIsolation.test.ts` (20 tests).
- Added `sosEmergencySecurity.test.tsx` (17 tests).

## Verification Results
All checks were independently executed and passed in the local environment:
- **Test Suite**: `npm test` passed **104 test files (812 tests)** (Exit code: 0).
- **TypeScript**: `npx tsc --noEmit` completed with **0 errors** (Exit code: 0).
- **Production Build**: `npm run build` succeeded (3,080 modules transformed, dist generated in 9.13s, Exit code: 0).
- **Model Integrity**: `node scripts/verify-models.cjs` verified 48 model files and 134 server files with **0 errors** (Exit code: 0).
- **Whitespace / Conflict Check**: `git diff --check` and `git diff --check main...HEAD` passed cleanly (Exit code: 0).

## Known Limitations & Blockers
1. **Certified Dispatch Integration**: HealthSphere persists emergency incidents and triggers in-app/WebSocket notifications. It is not connected to a certified PSAP/CAD 911 dispatch telecommunications gateway. The application explicitly informs users of this limitation.
2. **Post-Resolution SOS Retry Idempotency**: While active alerts are deduplicated via MongoDB upsert (`status: "active"`), an alert triggered after a previous alert was resolved creates a new incident record. An arbitrary cooldown window was intentionally not introduced to prevent blocking life-saving calls after false alarms. The UI warns the user accordingly.
