# HealthSphere AI — Production Deployment Playbook

This playbook provides operational procedures for deploying HealthSphere to production environments using Docker Compose, Kubernetes, or Bare Metal.

---

## 1. Production Architecture Overview

The production topology consists of 4 isolated container tiers:
1. **Frontend Reverse Proxy**: Nginx Alpine container serving minified static assets and terminating SSL/TLS.
2. **Backend API Cluster**: Node.js 20 Alpine application running under a non-root system user.
3. **Database Cluster**: MongoDB 7.0 with persistent storage volume mounts and authentication.
4. **Cache & Queue Tier**: Redis 7.2 Alpine with memory persistence.

---

## 2. Docker Compose Production Deployment

### 1. Provision Host Server
- OS: Ubuntu 22.04 LTS / Debian 12 / RHEL 9
- Minimum Spec: 4 vCPU, 8 GB RAM, 80 GB SSD
- Ports Open: 80 (HTTP), 443 (HTTPS)

### 2. Install Docker & Compose
```bash
sudo apt update && sudo apt install -y docker.io docker-compose-plugin
sudo systemctl enable --now docker
```

### 3. Deploy Stack
```bash
git clone https://github.com/Ashmita1206/HealthSphere.git /opt/healthsphere
cd /opt/healthsphere

# Configure production environment variables
cp .env.docker.example .env
nano .env # Set secure JWT_SECRET (min 32 chars) and database credentials

# Build and start all containers in background
docker compose -f docker-compose.yml up -d --build
```

### 4. Verify System Readiness
```bash
docker compose ps
curl -I http://localhost/health/readiness
# Expected: HTTP/1.1 200 OK
```

---

## 3. SSL / TLS Certificate Automation (Let's Encrypt)

To terminate SSL at the Nginx edge:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d healthsphere.yourdomain.com
```

Certbot automatically configures HTTP-to-HTTPS redirects and schedules certificate renewal crons.

---

## 4. Automated Backup & Disaster Recovery Schedule

To ensure HIPAA compliance and zero data loss, schedule daily automated snapshots:

```bash
# Edit host crontab
crontab -e

# Add daily 3:00 AM backup job:
0 3 * * * /opt/healthsphere/scripts/backup-db.sh >> /var/log/healthsphere_backup.log 2>&1
```

### Restoring from Backup
```bash
/opt/healthsphere/scripts/restore-db.sh /backups/mongodb/healthsphere_backup_20260911_030000.tar.gz
```

---

## 5. Zero-Downtime Rolling Update Workflow

```bash
cd /opt/healthsphere
git fetch origin main
git checkout main

# Rebuild images without bringing down live services
docker compose build backend frontend

# Restart services with minimal downtime
docker compose up -d --no-deps --build backend
docker compose up -d --no-deps --build frontend
```
