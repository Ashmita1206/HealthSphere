#!/usr/bin/env bash
# ====================================================
# HealthSphere AI — Production Database Backup Script
# Performs compressed mongodump with 14-day retention
# ====================================================

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/backups/mongodb}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="healthsphere_backup_${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"
MONGO_URI="${MONGODB_URI:-mongodb://localhost:27017/healthsphere}"
RETENTION_DAYS=14

echo "===================================================="
echo "Initiating HealthSphere Database Backup: ${TIMESTAMP}"
echo "===================================================="

mkdir -p "${BACKUP_DIR}"

# Execute mongodump with gzip compression
mongodump --uri="${MONGO_URI}" --out="${BACKUP_PATH}" --gzip

# Create tar archive
tar -czf "${BACKUP_PATH}.tar.gz" -C "${BACKUP_DIR}" "${BACKUP_NAME}"
rm -rf "${BACKUP_PATH}"

echo "✅ Backup created successfully: ${BACKUP_PATH}.tar.gz"

# Clean up backups older than RETENTION_DAYS
echo "Pruning backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "healthsphere_backup_*.tar.gz" -type f -mtime +${RETENTION_DAYS} -delete

echo "Backup operation finished successfully."
