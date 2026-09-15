#!/usr/bin/env bash
# ====================================================
# HealthSphere AI — Production Readiness Probe Script
# ====================================================

URL="${HEALTHCHECK_URL:-http://localhost:4000/health/readiness}"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${URL}" || echo "000")

if [ "${STATUS}" -eq 200 ]; then
  echo "✅ HealthSphere Backend is HEALTHY and READY (HTTP 200)"
  exit 0
else
  echo "❌ HealthSphere Readiness Check FAILED with status: ${STATUS}"
  exit 1
fi
