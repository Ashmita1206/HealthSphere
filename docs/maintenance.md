# HealthSphere Maintenance & Operational Runbook

---

## 1. Routine Maintenance Schedule

| Interval | Task | Command / Script | SLA Impact |
| :--- | :--- | :--- | :--- |
| **Hourly** | Diagnostic Probes | `curl -f http://localhost:4000/api/system/health` | None |
| **Daily (02:00 UTC)** | Database Backup & Checksum | `./scripts/backup-db.sh` | None (<2s lock) |
| **Weekly** | Log Rotation Archive Pruning | System logrotate / Winston automatic | None |
| **Monthly** | Dependency Security Audit | `npm audit` / GitHub Dependabot | Staging only |
| **Quarterly** | Disaster Recovery Simulation | Vitest DR Suite (`src/test/disasterRecovery.test.ts`) | Zero downtime |

---

## 2. Telemetry & Metric Thresholds

| Metric | Nominal Value | Warning Threshold | Critical Alert |
| :--- | :--- | :--- | :--- |
| **API Latency (p95)** | < 120ms | > 250ms | > 500ms |
| **Error Rate (5xx)** | < 0.1% | > 1.0% | > 3.0% |
| **Node.js RSS Memory** | < 300MB | > 700MB | > 1.2GB (trigger PM2 reload) |
| **Redis Memory** | < 128MB | > 200MB | > 240MB |
| **Dead Letter Queue (DLQ)** | 0 | > 5 | > 20 failed jobs |

---

## 3. Database Maintenance & Compaction

### Index Hygiene
Verify compound indexes on active collections:
```javascript
// Connect to MongoDB
mongosh "mongodb://localhost:27017/healthsphere"

// Verify index coverage
db.reports.getIndexes();
db.appointments.getIndexes();
db.auditlogs.getIndexes();
```

---

## 4. Log Rotation & Storage Management
Logs are stored in `/var/log/healthsphere` or `./logs/`:
- `healthsphere-combined.log`: Rotated at 10MB, retaining 5 compressed archives.
- `healthsphere-error.log`: Dedicated error trace log.
