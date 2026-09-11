#!/usr/bin/env bash
# ====================================================
# HealthSphere Automated Health & Readiness Probe
# Used by container orchestrators and monitoring daemons
# ====================================================

set -euo pipefail

TARGET_HOST="${HEALTH_HOST:-localhost}"
TARGET_PORT="${HEALTH_PORT:-4000}"
ENDPOINT="http://${TARGET_HOST}:${TARGET_PORT}/api/system/health"

echo "==> Probing HealthSphere System Health: ${ENDPOINT}"

HTTP_CODE=$(curl -s -o /tmp/health_response.json -w "%{http_code}" "${ENDPOINT}" || echo "000")

if [ "${HTTP_CODE}" -eq 200 ]; then
  echo "✔ HealthSphere Backend is HEALTHY (HTTP 200)"
  cat /tmp/health_response.json
  exit 0
else
  echo "✖ HealthSphere Backend is DEGRADED or DOWN (HTTP ${HTTP_CODE})"
  if [ -f /tmp/health_response.json ]; then
    cat /tmp/health_response.json
  fi
  exit 1
fi
