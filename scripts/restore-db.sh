#!/usr/bin/env bash
# ====================================================
# HealthSphere AI — Production Database Restore Script
# Restores from an authenticated compressed mongodump archive.
# ====================================================

set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <path-to-backup.tar.gz> [--drop]"
  exit 1
fi

ARCHIVE_PATH="$1"
DROP_FLAG="${2:---drop}"
MONGO_URI="${MONGODB_URI:-mongodb://localhost:27017/healthsphere}"

if [ ! -f "${ARCHIVE_PATH}" ]; then
  echo "❌ Error: File not found: ${ARCHIVE_PATH}"
  exit 1
fi

echo "===================================================="
echo "Initiating HealthSphere Database Restoration"
echo "Target Archive: ${ARCHIVE_PATH}"
echo "===================================================="

# Verify SHA256 checksum if available
if [ -f "${ARCHIVE_PATH}.sha256" ]; then
  echo "==> Verifying archive SHA256 integrity..."
  sha256sum -c "${ARCHIVE_PATH}.sha256"
fi

TEMP_RESTORE_DIR="/tmp/healthsphere_restore_$(date +%s)"
mkdir -p "${TEMP_RESTORE_DIR}"

echo "==> Extracting archive..."
tar -xzf "${ARCHIVE_PATH}" -C "${TEMP_RESTORE_DIR}"

echo "==> Restoring MongoDB database..."
if [ "${DROP_FLAG}" == "--drop" ]; then
  echo "Warning: --drop specified. Existing collections will be replaced."
  mongorestore --uri="${MONGO_URI}" --gzip --drop "${TEMP_RESTORE_DIR}"
else
  mongorestore --uri="${MONGO_URI}" --gzip "${TEMP_RESTORE_DIR}"
fi

rm -rf "${TEMP_RESTORE_DIR}"

echo "✅ Database restored successfully."
