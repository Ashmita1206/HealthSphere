#!/usr/bin/env bash
# ====================================================
# HealthSphere Instant Database Snapshot Utility
# Takes point-in-time pre-deployment snapshots with checksums.
# ====================================================

set -euo pipefail

SNAPSHOT_DIR="${SNAPSHOT_DIR:-/var/backups/healthsphere/snapshots}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
SNAPSHOT_NAME="snapshot_predeploy_${TIMESTAMP}"
DEST_PATH="${SNAPSHOT_DIR}/${SNAPSHOT_NAME}.tar.gz"

mkdir -p "${SNAPSHOT_DIR}"

echo "==> [${TIMESTAMP}] Taking Pre-Deployment Snapshot..."

if [ -z "${MONGODB_URI:-}" ]; then
  echo "Error: MONGODB_URI environment variable is required."
  exit 1
fi

TEMP_DIR=$(mktemp -d)
mongodump --uri="${MONGODB_URI}" --out="${TEMP_DIR}/dump" --gzip
tar -czf "${DEST_PATH}" -C "${TEMP_DIR}/dump" .
sha256sum "${DEST_PATH}" > "${DEST_PATH}.sha256"
rm -rf "${TEMP_DIR}"

echo "==> Snapshot created: ${DEST_PATH}"
echo "==> Verification Checksum: ${DEST_PATH}.sha256"
