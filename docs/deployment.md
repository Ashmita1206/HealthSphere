# HealthSphere Deployment Guide

## 1. Prerequisites
- Docker Engine 24.0+ and Docker Compose v2.20+
- Node.js 20 LTS (Active Long Term Support)
- MongoDB 7.0+
- Redis 7.2+

---

## 2. Environment Configuration
Copy the production environment template and configure secrets:
```bash
cp .env.production.example .env.production
```
Required secrets:
- `JWT_SECRET`: 64-character cryptographically random secret.
- `MONGODB_URI`: Production MongoDB connection string with replica set enabled.
- `REDIS_URL`: Production Redis instance URI.
- `CLOUDINARY_*`: Enterprise Cloudinary storage credentials.

---

## 3. Docker Production Deployment
To spin up the complete containerized stack:
```bash
docker compose -f docker-compose.yml up -d --build
```
This orchestrates:
1. `healthsphere-mongodb`: Database daemon with persistent volume `mongodb_data`.
2. `healthsphere-redis`: Cache and BullMQ broker with `allkeys-lru` eviction.
3. `healthsphere-backend`: Express 5 application with Tini init system and non-root runner.
4. `healthsphere-frontend`: Nginx reverse proxy serving compiled SPA assets and routing `/api` and `/socket.io`.

Verify container health:
```bash
docker compose ps
docker compose logs -f backend
```

---

## 4. PM2 Bare-Metal Cluster Deployment
For native Linux VM deployments using PM2:
```bash
npm ci --legacy-peer-deps
npm run build
cd server && npm ci --omit=dev

pm2 start ../ecosystem.config.cjs --env production
pm2 save
pm2 startup
```

---

## 5. Zero-Downtime Rollback Procedure
In the event of an emergency:
1. Run GitHub Actions Rollback workflow `.github/workflows/rollback.yml` with target release tag.
2. Or trigger manual failover:
```bash
./scripts/emergency-failover.sh
```
