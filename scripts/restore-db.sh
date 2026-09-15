#!/usr/bin/env bash
# ====================================================
# HealthSphere AI — Production Database Restore Script
# Restores compressed mongodump archive to MongoDB
# ====================================================

set -euo pipefail

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <path-to-backup.tar.gz>"
    exit 1
fi

ARCHIVE_PATH="$1"
MONGO_URI="${MONGODB_URI:-mongodb://localhost:27017/healthsphere}"
TEMP_RESTORE_DIR="/tmp/healthsphere_restore_$(date +%s)"

if [ ! -f "${ARCHIVE_PATH}" ]; then
    echo "❌ Error: Backup archive not found at ${ARCHIVE_PATH}"
    exit 1
fi

echo "===================================================="
echo "Initiating HealthSphere Database Restoration"
echo "Target Archive: ${ARCHIVE_PATH}"
echo "===================================================="

mkdir -p "${TEMP_RESTORE_DIR}"
tar -xzf "${ARCHIVE_PATH}" -C "${TEMP_RESTORE_DIR}"

# Execute mongorestore
mongorestore --uri="${MONGO_URI}" --gzip --drop "${TEMP_RESTORE_DIR}"/*

# Cleanup temporary extracted files
rm -rf "${TEMP_RESTORE_DIR}"

echo "✅ Database restored successfully."
