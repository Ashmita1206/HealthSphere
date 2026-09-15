#!/usr/bin/env bash
# ====================================================
# HealthSphere AI — Production Readiness Probe Script
# Used by container orchestrators and monitoring daemons
# ====================================================

set -euo pipefail

TARGET_HOST="${HEALTH_HOST:-localhost}"
TARGET_PORT="${HEALTH_PORT:-4000}"
URL="${HEALTHCHECK_URL:-http://${TARGET_HOST}:${TARGET_PORT}/health/readiness}"

echo "==> Probing HealthSphere System Readiness: ${URL}"

STATUS=$(curl -s -o /tmp/health_response.json -w "%{http_code}" "${URL}" || echo "000")

if [ "${STATUS}" -eq 200 ]; then
  echo "✅ HealthSphere Backend is HEALTHY and READY (HTTP 200)"
  if [ -f /tmp/health_response.json ]; then
    cat /tmp/health_response.json
    echo ""
  fi
  exit 0
else
  echo "❌ HealthSphere Readiness Check FAILED with status: ${STATUS}"
  if [ -f /tmp/health_response.json ]; then
    cat /tmp/health_response.json
    echo ""
  fi
  exit 1
fi
