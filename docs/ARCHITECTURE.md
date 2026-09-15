# HealthSphere AI — Enterprise Architecture Specification

HealthSphere is an AI-native Healthcare Operating System built to enterprise hospital standards.
This document outlines the architectural layers, container topology, security perimeter, and real-time data flows.

---

## 1. System Context Diagram (C4 Level 1)

```mermaid
C4Context
  title System Context Diagram for HealthSphere Healthcare OS

  Person(patient, "Patient", "Uses mobile/desktop web app to track health, consult doctors, and view analytics")
  Person(doctor, "Doctor / Specialist", "Conducts consultations, manages patient charts, generates SOAP notes")
  Person(admin, "Hospital Administrator", "Monitors clinical capacity, audit logs, and system operations")

  System(healthsphere, "HealthSphere AI OS", "Full-stack MERN healthcare system with AI intelligence and realtime collaboration")

  System_Ext(gemini, "Google Gemini & OpenAI", "Clinical diagnosis assistance, report intelligence, and digital twins")
  System_Ext(wearables, "Wearable Health APIs", "Continuous biometric telemetry (Fitbit, Apple HealthKit)")
  System_Ext(smtp, "Transactional SMTP", "Secure password reset and notification delivery")

  Rel(patient, healthsphere, "Uses", "HTTPS / WSS")
  Rel(doctor, healthsphere, "Conducts clinical work on", "HTTPS / WSS")
  Rel(admin, healthsphere, "Audits and administers via", "HTTPS")

  Rel(healthsphere, gemini, "Calls for clinical NLP & AI", "HTTPS / REST")
  Rel(healthsphere, wearables, "Ingests vitals from", "Webhooks / REST")
  Rel(healthsphere, smtp, "Dispatches alerts via", "TLS / SMTP")
```

---

## 2. Container Architecture Diagram (C4 Level 2)

```mermaid
graph TD
  subgraph Client_Perimeter [Edge & Client Layer]
    WebBrowser[Web Browser / React 18 SPA]
    MobilePWA[Progressive Web App / Offline Cache]
    NginxProxy[Nginx Alpine Gateway :80]
  end

  subgraph App_Cluster [Backend Micro-Monolith :4000]
    SecurityGateway[Security & Rate Limiting Gateway]
    AuthEngine[JWT Rotation & Session Manager]
    RestAPI[Express.js Dual API Router: /api & /api/v1]
    RealtimeHub[Socket.IO Infrastructure Hub]
    WorkerQueue[Background Async Job Queue]
    PrometheusRegistry[Metrics & Prometheus Exporter]
  end

  subgraph State_Storage [Data & Storage Perimeter]
    MongoCluster[(MongoDB 7.0 Replica / Persistent Volume)]
    RedisCache[(Redis 7.2 Cache / TTL Store)]
    DiskLogs[(Rotating Structured JSON Logs)]
  end

  WebBrowser --> NginxProxy
  MobilePWA --> NginxProxy
  NginxProxy -->|/api/*| SecurityGateway
  NginxProxy -->|/socket.io/*| RealtimeHub
  NginxProxy -->|/health, /metrics| PrometheusRegistry
  NginxProxy -->|Static Assets /| WebBrowser

  SecurityGateway --> AuthEngine
  AuthEngine --> RestAPI
  RestAPI --> RedisCache
  RestAPI --> MongoCluster
  RestAPI --> WorkerQueue
  RealtimeHub --> RedisCache
  RealtimeHub --> MongoCluster
  WorkerQueue --> MongoCluster
  RestAPI --> DiskLogs
```

---

## 3. Security Perimeter & Request Pipeline

```mermaid
sequenceDiagram
  autonumber
  actor Client as Web Client / Doctor App
  participant Gateway as Nginx / Edge
  participant Sec as Security & Rate Limiter
  participant Auth as Auth & Token Rotation
  participant Controller as Clinical Controller
  participant Cache as Multi-Tier Cache
  participant DB as MongoDB Database

  Client->>Gateway: HTTPS Request (Authorization: Bearer <jwt>)
  Gateway->>Sec: Forward with X-Real-IP
  Sec->>Sec: Assign UUID (x-request-id)
  Sec->>Sec: Apply Helmet CSP & CORS
  Sec->>Sec: Sanitize NoSQL Injection & XSS
  Sec->>Sec: Check Tiered Rate Limiters
  Sec->>Auth: Validate JWT & Verify Account Lock Status
  Auth->>Controller: Authenticated Request (req.user, req.id)
  Controller->>Cache: Check Cached Result (GET /api/v1/...)
  alt Cache HIT
    Cache-->>Controller: Return Cached Payload
    Controller-->>Client: HTTP 200 (x-cache: HIT, x-request-id)
  else Cache MISS
    Controller->>DB: Execute Optimized Query (.lean(), indexed)
    DB-->>Controller: Return Raw Record
    Controller->>Cache: Store Result with TTL
    Controller-->>Client: HTTP 200 (x-cache: MISS, gzip compressed)
  end
```

---

## 4. Real-Time Socket Orchestration & Presence

HealthSphere coordinates 4 distinct socket namespaces and rooms:
- `user:<userId>`: Individual push notifications, personal prescription reminders, urgent vitals alarms.
- `consultation:<id>`: Multi-participant live clinical room supporting shared notes, patient chart locks, and typing indicators.
- `presence:hospital`: Real-time availability dashboard broadcasting doctor statuses (`AVAILABLE`, `BUSY`, `ON_CALL`, `OFFLINE`) and patient waiting room positions.
- `emergency:broadcast`: Global high-priority incident channel triggering audio/visual alerts across the hospital facility.

---

## 5. High Availability, Caching & Resilience

1. **Multi-Tier Caching**:
   - Level 1: In-Memory TTL store with automatic microsecond eviction.
   - Level 2: Redis container cluster with pub/sub invalidation.
   - Level 3: Nginx static immutable caching for frontend assets (1 year TTL).
2. **Offline-First PWA Support**:
   - Client service worker intercepts network failures and persists mutations to IndexedDB.
   - Background sync replays queued clinical edits when connectivity resumes.
3. **Automated Disaster Recovery**:
   - `scripts/backup-db.sh` runs automated daily snapshots with gzip compression and 14-day rolling retention.
   - `scripts/restore-db.sh` enables one-command database recovery with integrity checks.
