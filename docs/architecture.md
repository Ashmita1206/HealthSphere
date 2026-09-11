# HealthSphere Architecture Specification
## AI-Powered Healthcare Operating System

---

## 1. System Topology & Tiered Architecture

HealthSphere is engineered as an enterprise-grade, distributed AI Healthcare Operating System built upon a hardened MERN stack, Redis caching layer, BullMQ asynchronous queue workers, and Nginx reverse proxy.

```
                          [Edge / Client Layer]
       +-----------------------------------------------------------+
       |   React 18 SPA + Vite 8 + Tailwind CSS + Framer Motion    |
       |   Role-Based Portals: Patient | Doctor | Admin | Emergency |
       +-----------------------------------------------------------+
                                     |
                                HTTPS / WSS
                                     v
                       [Nginx Reverse Proxy & SSL]
       +-----------------------------------------------------------+
       |  - TLS Termination & HTTP/2                                |
       |  - Static Asset Gzip/Brotli Caching                       |
       |  - Rate Limiting & WebSocket Upgrades                     |
       +-----------------------------------------------------------+
                                     |
               +---------------------+---------------------+
               | (HTTP REST /api)                          | (WebSocket /socket.io)
               v                                           v
    [Express 5 Application Cluster]             [Socket.IO Realtime Server]
  +-----------------------------------+     +--------------------------------+
  | - Helmet CSP & Security Headers   |     | - Multi-device Presence System |
  | - Double-Submit CSRF & Sanitizer  |     | - Doctor/Patient Online Status |
  | - Request Correlation Tracing     |     | - WebRTC Video Signaling       |
  | - Native Gzip Payload Compression |     | - Low-latency Notification Bus |
  +-----------------------------------+     +--------------------------------+
               |                                           |
               +---------------------+---------------------+
                                     |
                 +-------------------+-------------------+
                 v                                       v
    [Redis 7.2 Performance Layer]            [MongoDB 7.0 Document DB]
  +---------------------------------+      +---------------------------------+
  | - Session Token Cache (1h TTL)  |      | - HIPAA Audited Event Store     |
  | - AI Diagnostics Cache (24h)    |      | - Compound Indexed Collections  |
  | - Real-time Dashboard Caching   |      | - Patient Electronic Records    |
  | - Sub/Pub & Presence Store      |      | - Telemedicine Consultations    |
  +---------------------------------+      +---------------------------------+
                 |
                 v
     [BullMQ Background Worker]
  +---------------------------------+
  | - Email Queue (Transactional)   |
  | - Medication Reminder Queue     |
  | - Push Notification Streamer    |
  | - Asynchronous AI Inference     |
  | - OCR Medical Report Pipeline   |
  | - Dead Letter Queue (DLQ)       |
  +---------------------------------+
```

---

## 2. Core Architectural Pillars

### A. Modular Layered Design
- **Controllers**: Thin request orchestrators handling input extraction and HTTP response formulation.
- **Services**: Pure business logic modules (`tokenService`, `cacheService`, `queueService`, `fileStorageService`, `presenceService`, `auditService`, `metricsService`).
- **Middlewares**: Composable defense-in-depth pipeline (Security, NoSQL Sanitizer, XSS defense, Rate Limiter, Gzip Compression, Request Logger).
- **Models**: High-fidelity Mongoose schemas with indexing optimization, validation, and automated timestamps.

### B. Scalability & Throughput Optimization
1. **Redis Caching**:
   - Sub-caches for Sessions, AI Responses, Dashboards, Analytics, and Notifications.
   - Automatic pattern invalidation (`invalidatePattern('dashboard:*')`).
2. **Database Query Tuning**:
   - Standardized cursor pagination (`skip`/`limit` with bounds checking).
   - Universal `.lean()` usage on query pipelines to bypass Mongoose document hydration overhead.
   - Optimized `$facet` aggregation pipelines for compound reporting.
3. **HTTP Compression**:
   - Dynamic gzip/deflate on payloads > 1024 bytes.

---

## 3. Security & Governance (HIPAA / SOC2)
- **Zero-Trust Token Model**: Dual-token architecture with 15-minute short-lived access tokens and 7-day secure HTTP-only refresh tokens.
- **CSRF & Injection Defense**: Double-submit CSRF cookie verification for state-changing operations and deep NoSQL/XSS key filtering.
- **Audit Trails**: Immutable `AuditLog` collection recording actor, action, resource, IP address, user-agent, and status with 7-year retention.
