#!/usr/bin/env bash
# ====================================================
# HealthSphere Database Restore Utility
# Restores from an authenticated compressed mongodump archive.
# ====================================================

set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <path-to-backup.tar.gz> [--drop]"
  exit 1
fi

ARCHIVE_PATH="$1"
DROP_FLAG="${2:-}"

if [ ! -f "${ARCHIVE_PATH}" ]; then
  echo "Error: File not found: ${ARCHIVE_PATH}"
  exit 1
fi

if [ -z "${MONGODB_URI:-}" ]; then
  echo "Error: MONGODB_URI environment variable is required."
  exit 1
fi

# Verify SHA256 checksum if available
if [ -f "${ARCHIVE_PATH}.sha256" ]; then
  echo "==> Verifying archive SHA256 integrity..."
  sha256sum -c "${ARCHIVE_PATH}.sha256"
fi

TEMP_EXTRACT_DIR=$(mktemp -d)

echo "==> Extracting archive..."
tar -xzf "${ARCHIVE_PATH}" -C "${TEMP_EXTRACT_DIR}"

echo "==> Restoring MongoDB database..."
if [ "${DROP_FLAG}" == "--drop" ]; then
  echo "Warning: --drop specified. Existing collections will be replaced."
  mongorestore --uri="${MONGODB_URI}" --gzip --drop "${TEMP_EXTRACT_DIR}"
else
  mongorestore --uri="${MONGODB_URI}" --gzip "${TEMP_EXTRACT_DIR}"
fi

rm -rf "${TEMP_EXTRACT_DIR}"

echo "==> Restore completed successfully."
