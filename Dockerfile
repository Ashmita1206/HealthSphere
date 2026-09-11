# ====================================================
# HealthSphere Frontend Production Multi-Stage Dockerfile
# Stage 1: Build Application with Node.js
# Stage 2: Serve Production Assets with Nginx Alpine
# ====================================================

# -----------------
# 1. Build Stage
# -----------------
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build arguments for environment variables
ARG VITE_API_URL
ARG VITE_SOCKET_URL

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_SOCKET_URL=${VITE_SOCKET_URL}
ENV NODE_ENV=production

# Install build dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy source code and build
COPY . .
RUN npm run build

# -----------------
# 2. Production Stage
# -----------------
FROM nginx:1.27-alpine AS runner

# Add non-root security improvements & remove default config
RUN rm -rf /etc/nginx/conf.d/default.conf \
    && rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

# Copy compiled assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP and HTTPS ports
EXPOSE 80 443

# Healthcheck to ensure Nginx is actively serving
HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
