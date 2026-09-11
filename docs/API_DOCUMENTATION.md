# HealthSphere AI — Production API Reference Catalog

All API endpoints are dual-aliased under `/api` and `/api/v1`.
Authentication is performed via JSON Web Tokens (JWT) in the `Authorization: Bearer <token>` header.

---

## 1. Standard Protocol Headers

| Header | Direction | Description |
| :--- | :--- | :--- |
| `Authorization` | Request | `Bearer <access_token>` |
| `x-request-id` | Both | UUID v4 tracing identifier propagated end-to-end |
| `x-refresh-token` | Request/Response | Session refresh token string |
| `x-cache` | Response | `HIT` or `MISS` from multi-tier cache |
| `Content-Encoding`| Response | `gzip` or `deflate` when compressed |

---

## 2. Standard Response Schemas

### Standard Success Response
```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "total": 120,
    "page": 1,
    "limit": 20,
    "totalPages": 6,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Standard Error Response
```json
{
  "success": false,
  "message": "Human readable error description",
  "error": {
    "code": "VALIDATION_ERROR | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | RATE_LIMIT_EXCEEDED | INTERNAL_SERVER_ERROR",
    "message": "Error details",
    "details": [ ... ],
    "requestId": "9c1a5db4-4b53-4b68-b789-f538eef01198",
    "timestamp": "2026-09-11T12:00:00.000Z"
  }
}
```

---

## 3. Authentication & Security Endpoints (`/api/v1/auth`)

### `POST /api/v1/auth/signup`
Creates a new patient, doctor, nurse, or admin account.
- **Request Body**:
  ```json
  {
    "email": "doctor@hospital.org",
    "password": "SecurePassword123!",
    "name": "Dr. Sarah Connor",
    "role": "doctor"
  }
  ```
- **Response**: `201 Created` with `accessToken`, `refreshToken`, and user profile.

### `POST /api/v1/auth/login`
Authenticates credentials with rate limiting and account lockout protection (5 failed attempts locks account for 15 minutes).
- **Request Body**:
  ```json
  { "email": "doctor@hospital.org", "password": "SecurePassword123!" }
  ```
- **Response**: `200 OK` (or `423 Locked` if locked) with tokens and session metadata.

### `POST /api/v1/auth/refresh`
Performs token rotation. Invalids previous refresh token and issues a new token pair. Detects token reuse attacks and invalidates the entire token family if breached.
- **Request Body**:
  ```json
  { "refreshToken": "session_id.secret_token" }
  ```

### `GET /api/v1/auth/sessions` (Protected)
Retrieves all active device sessions for the authenticated user (device type, OS, browser, IP, last active).

### `DELETE /api/v1/auth/sessions/:sessionId` (Protected)
Manually revokes an active session.

### `GET /api/v1/auth/login-history` (Protected)
Returns audit logs of recent successful, failed, and locked login attempts.

### `POST /api/v1/auth/forgot-password` & `POST /api/v1/auth/reset-password`
Generates and verifies cryptographic password reset tokens with 1-hour expiration.

---

## 4. Observability & Infrastructure Endpoints

### `GET /health`
Comprehensive system health report.
- **Response (200 OK or 503 Service Unavailable)**:
  ```json
  {
    "status": "UP",
    "timestamp": "2026-09-11T12:00:00.000Z",
    "uptimeSeconds": 86400,
    "services": {
      "database": { "status": "connected", "healthy": true },
      "memory": { "heapUsedMb": 114, "rssMb": 218 }
    }
  }
  ```

### `GET /health/liveness`
Kubernetes liveness probe: returns `{"status": "alive"}`.

### `GET /health/readiness`
Kubernetes readiness probe: verifies database connectivity before routing traffic.

### `GET /metrics`
Standard Prometheus format text exposition for scraping HTTP latency, requests count, active socket connections, and heap memory.

### `GET /api/features`
Dynamic feature flag state query for feature rollouts.

---

## 5. Clinical & Hospital Modules

- `GET/POST /api/v1/consultations`: Live consultations and clinical video visits
- `GET/POST /api/v1/records`: Encrypted patient records and sharing permissions
- `GET/POST /api/v1/medical-profile`: Comprehensive patient medical history
- `GET/POST /api/v1/wearables`: Continuous vital telemetry ingestion
- `GET/POST /api/v1/ai/symptoms`: AI-powered symptom analysis & triage
- `GET/POST /api/v1/ai/assistant`: AI clinical copilot & dialogue
- `GET /api/v1/admin/audit-logs`: (Admin only) Full HIPAA compliance audit trail
