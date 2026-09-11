# ====================================================
# HealthSphere Backend Production Dockerfile
# Node.js 20 Alpine with Tini Init System & Non-Root User
# ====================================================

FROM node:20-alpine AS base

# Install tini for clean signal handling and process reaping
RUN apk add --no-cache tini wget

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=4000

# Install production dependencies first (layer caching)
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copy application source
COPY . .

# Ensure app files are owned by unprivileged node user
RUN chown -R node:node /app

# Switch to non-root user for security hardening
USER node

# Expose backend API port
EXPOSE 4000

# Container healthcheck
HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/healthcheck || exit 1

# Use tini as PID 1 entrypoint for graceful shutdown signal handling
ENTRYPOINT ["/sbin/tini", "--"]

CMD ["node", "index.js"]
