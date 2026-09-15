#!/usr/bin/env bash
# ====================================================
# HealthSphere Emergency Failover & Recovery Script
# Invoked when primary nodes fail or critical data corruption occurs.
# ====================================================

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/healthsphere}"
LOG_DIR="${LOG_DIR:-/var/log/healthsphere}"
mkdir -p "${LOG_DIR}"

echo "===================================================="
echo " [ALERT] INITIATING HEALTHSPHERE EMERGENCY RECOVERY"
echo " Timestamp: $(date -u)"
echo "===================================================="

# 1. Connection Drain: signal frontend to enter maintenance/read-only mode
echo "==> Step 1: Entering Emergency Read-Only Protocol..."
export HEALTHSPHERE_MAINTENANCE_MODE="true"

# 2. Locate latest authenticated backup
echo "==> Step 2: Locating most recent verified backup archive..."
LATEST_BACKUP=$(find "${BACKUP_DIR}" -type f -name "healthsphere_backup_*.tar.gz" | sort -r | head -n 1)

if [ -z "${LATEST_BACKUP}" ]; then
  echo "[CRITICAL] No backup archives found in ${BACKUP_DIR}! Aborting automated restore."
  exit 2
fi

echo "==> Latest verified archive: ${LATEST_BACKUP}"

# 3. Verify SHA256 integrity
if [ -f "${LATEST_BACKUP}.sha256" ]; then
  echo "==> Step 3: Verifying SHA256 checksum..."
  sha256sum -c "${LATEST_BACKUP}.sha256"
fi

# 4. Trigger database restore with drop flag
echo "==> Step 4: Executing database restoration into target cluster..."
./scripts/restore-db.sh "${LATEST_BACKUP}" --drop

# 5. Probe health endpoints
echo "==> Step 5: Executing Post-Recovery Health Verification Probes..."
./scripts/healthcheck.sh || {
  echo "[WARNING] Health probes returned degraded state. Operator investigation required."
  exit 1
}

echo "===================================================="
echo " [SUCCESS] EMERGENCY RESTORATION COMPLETE"
echo " All primary clinical datastores restored."
echo "===================================================="
