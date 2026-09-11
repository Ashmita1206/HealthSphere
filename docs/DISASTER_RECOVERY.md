# HealthSphere Disaster Recovery & Rollback Guide

This guide establishes enterprise Business Continuity (BC) and Disaster Recovery (DR) protocols for the HealthSphere AI Healthcare Operating System in compliance with HIPAA § 164.308(a)(7).

---

## 1. Objectives & Metrics
- **Recovery Point Objective (RPO)**: **< 1 hour** (Maximum permissible data loss in catastrophic outage).
- **Recovery Time Objective (RTO)**: **< 15 minutes** (Maximum target downtime to full restoration).
- **Backup Retention Period**: **30 days** rotating daily archives with SHA-256 validation.

---

## 2. Disaster Recovery Automation Architecture

```
                 [Primary Production MongoDB]
                              |
                     (Hourly / Daily Cron)
                              v
                   [scripts/backup-db.sh]
                              |
            +-----------------+-----------------+
            v                                   v
  [Compressed GZIP Dump]               [SHA-256 Checksum]
            |                                   |
            +-----------------+-----------------+
                              v
                 [/var/backups/healthsphere/]
                              |
                     (Incident Trigger)
                              v
               [scripts/emergency-failover.sh]
                              v
                  [scripts/restore-db.sh]
                              v
                [Restored Cluster Verified]
```

---

## 3. Automated Cron Backup Configuration

Add the following to the system or container crontab (`crontab -e`):

```bash
# HealthSphere Automated Backups: Run daily at 02:00 UTC
0 2 * * * /app/scripts/backup-db.sh >> /var/log/healthsphere/backup.log 2>&1

# HealthSphere Point-in-Time Snapshot: Run every 6 hours
0 */6 * * * /app/scripts/snapshot-db.sh >> /var/log/healthsphere/snapshot.log 2>&1
```

---

## 4. Emergency Rollback Protocol

When an unrecoverable defect, corrupted migration, or severe incident occurs:

### Step 1: Immediate GitHub Actions Automated Rollback
1. Navigate to **Actions** -> **HealthSphere Emergency Rollback** (`.github/workflows/rollback.yml`).
2. Input the target release tag (e.g. `v1.2.0`) or commit SHA.
3. Provide the mandatory incident ticket ID (e.g., `INC-8821`).
4. Trigger workflow. WebSocket connections will be gracefully drained and services reverted.

### Step 2: Database Restoration from Snapshot
If data corruption occurred:
```bash
# 1. Execute emergency failover
./scripts/emergency-failover.sh

# Or manually restore specific snapshot:
./scripts/restore-db.sh /var/backups/healthsphere/snapshots/snapshot_predeploy_20260911_120000.tar.gz --drop
```

### Step 3: Post-Recovery Health Verification
```bash
# Verify all HTTP and WebSocket endpoints
./scripts/healthcheck.sh

# Run synthetic clinical telemetry probe
curl -f http://localhost:4000/api/system/health
```

---

## 5. Recovery Simulation Testing

To ensure Disaster Recovery procedures work reliably during real emergencies, automated recovery testing runs continuously in the CI pipeline (`src/test/disasterRecovery.test.ts`).
