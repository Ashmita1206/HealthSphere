# HealthSphere AI — Enterprise Developer Handbook

Welcome to the HealthSphere core development team.
This guide outlines local development workflows, architectural patterns, coding guidelines, and testing protocols.

---

## 1. Prerequisites

- **Node.js**: 20.x LTS or higher
- **Package Manager**: `npm` 10.x
- **Database**: MongoDB 7.0 (local instance or Docker container)
- **Optional Cache**: Redis 7.2 (if unavailable, internal high-performance in-memory cache activates automatically)
- **Docker & Docker Compose**: (Required for containerized verification)

---

## 2. Quickstart: Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/Ashmita1206/HealthSphere.git
cd HealthSphere
```

### 2. Install dependencies
```bash
# Install frontend root dependencies
npm ci

# Install backend dependencies
cd server
npm ci
cd ..
```

### 3. Configure environment variables
```bash
cp .env.example .env
cp .env.docker.example server/.env
```

### 4. Start Development Servers
In two terminal sessions:

**Terminal 1 (Backend API & Socket.IO):**
```bash
cd server
npm run dev
# Server boots on http://localhost:4000 with nodemon hot reload
```

**Terminal 2 (Frontend Client):**
```bash
npm run dev
# Vite client boots on http://localhost:8081 (or 5173)
```

---

## 3. Containerized Development with Docker

To boot the entire stack (MongoDB, Redis, Backend, Frontend) with hot-reloading:
```bash
docker-compose -f docker-compose.dev.yml up --build
```

---

## 4. Testing & Code Quality Protocols

### Running Automated Unit & Integration Tests
```bash
# Run a specific test suite
npx vitest run src/test/apiSecurityLayer.test.ts

# Run the complete Phase 3 regression suite
node scripts/run-regression-suite.cjs
```

### TypeScript Safety Check
```bash
# Verify type safety without emitting artifacts
npx tsc --noEmit
```

### Production Build Validation
```bash
npm run build
```

---

## 5. Coding & Commit Conventions

- **Conventional Commits**:
  - `feat(security): ...`
  - `feat(auth): ...`
  - `feat(performance): ...`
  - `feat(realtime): ...`
  - `feat(observability): ...`
  - `fix(routes): ...`
- **Backwards Compatibility**:
  - Never remove existing UI pages or modify working features without architectural review.
  - All API routes must maintain compatibility across `/api` and `/api/v1`.
- **Defensive Engineering**:
  - All input payloads must be sanitized for NoSQL injection and XSS.
  - Always bound pagination queries (`page`, `limit`).
  - Model definitions used in Vitest should include `{ autoIndex: false, bufferCommands: false }` to avoid socket timeouts.
