#!/usr/bin/env bash
# ====================================================
# HealthSphere Production Database Backup Utility
# Performs compressed mongodump, calculates SHA256,
# and enforces a 30-day retention policy.
# ====================================================

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/healthsphere}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="healthsphere_backup_${TIMESTAMP}"
DEST_PATH="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

echo "==> [${TIMESTAMP}] Starting HealthSphere MongoDB Backup..."

if [ -z "${MONGODB_URI:-}" ]; then
  echo "Error: MONGODB_URI environment variable is required."
  exit 1
fi

TEMP_DUMP_DIR=$(mktemp -d)

# Perform database dump
mongodump --uri="${MONGODB_URI}" --out="${TEMP_DUMP_DIR}/dump" --gzip

# Compress into single archive
tar -czf "${DEST_PATH}" -C "${TEMP_DUMP_DIR}/dump" .

# Calculate SHA256 checksum for audit and integrity verification
sha256sum "${DEST_PATH}" > "${DEST_PATH}.sha256"

# Clean up temp files
rm -rf "${TEMP_DUMP_DIR}"

echo "==> Backup completed successfully: ${DEST_PATH}"
echo "==> Checksum saved to: ${DEST_PATH}.sha256"

# Prune old backups past retention threshold
echo "==> Enforcing ${RETENTION_DAYS}-day backup retention..."
find "${BACKUP_DIR}" -type f -name "healthsphere_backup_*.tar.gz*" -mtime +"${RETENTION_DAYS}" -exec rm -f {} \;

echo "==> Backup and rotation routine complete."
