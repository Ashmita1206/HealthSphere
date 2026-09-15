#!/usr/bin/env bash
# ====================================================
# HealthSphere AI — Production Database Backup Script
# Performs compressed mongodump, calculates SHA256,
# and enforces rolling snapshot retention.
# ====================================================

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/healthsphere}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="healthsphere_backup_${TIMESTAMP}"
DEST_PATH="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
MONGO_URI="${MONGODB_URI:-mongodb://localhost:27017/healthsphere}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

echo "===================================================="
echo "Initiating HealthSphere Database Backup: ${TIMESTAMP}"
echo "===================================================="

TEMP_DUMP_DIR=$(mktemp -d)

# Perform database dump with gzip compression
mongodump --uri="${MONGO_URI}" --out="${TEMP_DUMP_DIR}/dump" --gzip

# Compress into single archive
tar -czf "${DEST_PATH}" -C "${TEMP_DUMP_DIR}/dump" .

# Calculate SHA256 checksum for audit and integrity verification
sha256sum "${DEST_PATH}" > "${DEST_PATH}.sha256"

# Clean up temp files
rm -rf "${TEMP_DUMP_DIR}"

echo "✅ Backup created successfully: ${DEST_PATH}"
echo "✅ Checksum saved to: ${DEST_PATH}.sha256"

# Prune old backups past retention threshold
echo "Pruning backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -type f -name "healthsphere_backup_*.tar.gz*" -mtime +"${RETENTION_DAYS}" -exec rm -f {} \;

echo "Backup operation finished successfully."
