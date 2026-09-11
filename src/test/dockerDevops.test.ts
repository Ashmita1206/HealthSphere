import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('F40 — Docker & Container Orchestration Stack', () => {
  const rootDir = path.resolve(__dirname, '../../');

  describe('Frontend Dockerfile', () => {
    it('implements multi-stage build with Nginx runner and health check', () => {
      const dockerfilePath = path.join(rootDir, 'Dockerfile');
      expect(fs.existsSync(dockerfilePath)).toBe(true);

      const content = fs.readFileSync(dockerfilePath, 'utf-8');
      expect(content).toContain('FROM node:20-alpine AS builder');
      expect(content).toContain('FROM nginx:alpine AS runner');
      expect(content).toContain('EXPOSE 80');
      expect(content).toContain('HEALTHCHECK');
      expect(content).toContain('default.conf');
    });
  });

  describe('Backend Dockerfile', () => {
    it('implements non-root user security and health probe', () => {
      const backendDockerfilePath = path.join(rootDir, 'Dockerfile.backend');
      expect(fs.existsSync(backendDockerfilePath)).toBe(true);

      const content = fs.readFileSync(backendDockerfilePath, 'utf-8');
      expect(content).toContain('FROM node:20-alpine');
      expect(content).toContain('adduser');
      expect(content).toContain('USER appuser');
      expect(content).toContain('EXPOSE 4000');
      expect(content).toContain('HEALTHCHECK');
      expect(content).toContain('/health/liveness');
    });
  });

  describe('Nginx Reverse Proxy Configuration', () => {
    it('configures proxies for API, WebSockets, monitoring, and SPA fallback', () => {
      const nginxConfPath = path.join(rootDir, 'nginx/conf.d/default.conf');
      expect(fs.existsSync(nginxConfPath)).toBe(true);

      const content = fs.readFileSync(nginxConfPath, 'utf-8');
      expect(content).toContain('upstream backend_cluster');
      expect(content).toContain('location /api/');
      expect(content).toContain('location /socket.io/');
      expect(content).toContain('proxy_set_header Upgrade $http_upgrade');
      expect(content).toContain('try_files $uri $uri/ /index.html;');
      expect(content).toContain('gzip on;');
    });
  });

  describe('Docker Compose Configurations', () => {
    it('defines production multi-container stack with Mongo, Redis, Backend, Frontend', () => {
      const composePath = path.join(rootDir, 'docker-compose.yml');
      expect(fs.existsSync(composePath)).toBe(true);

      const content = fs.readFileSync(composePath, 'utf-8');
      expect(content).toContain('mongodb:');
      expect(content).toContain('redis:');
      expect(content).toContain('backend:');
      expect(content).toContain('frontend:');
      expect(content).toContain('mongodb_data:');
      expect(content).toContain('redis_data:');
      expect(content).toContain('healthcheck:');
    });

    it('defines development compose file with volume mounts', () => {
      const devComposePath = path.join(rootDir, 'docker-compose.dev.yml');
      expect(fs.existsSync(devComposePath)).toBe(true);

      const content = fs.readFileSync(devComposePath, 'utf-8');
      expect(content).toContain('healthsphere_dev_backend');
      expect(content).toContain('healthsphere_dev_frontend');
    });

    it('provides environment template for docker', () => {
      const envPath = path.join(rootDir, '.env.docker.example');
      expect(fs.existsSync(envPath)).toBe(true);

      const content = fs.readFileSync(envPath, 'utf-8');
      expect(content).toContain('MONGODB_URI=');
      expect(content).toContain('REDIS_URL=');
      expect(content).toContain('JWT_SECRET=');
    });
  });
});
