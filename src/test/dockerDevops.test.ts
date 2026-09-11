import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('F35 — Docker Production Environment Suite', () => {
  const rootDir = path.resolve(__dirname, '../..');

  it('1. Frontend Dockerfile: implements multi-stage build with Nginx runner and healthcheck', () => {
    const dockerfilePath = path.join(rootDir, 'Dockerfile');
    expect(fs.existsSync(dockerfilePath)).toBe(true);

    const content = fs.readFileSync(dockerfilePath, 'utf-8');
    expect(content).toMatch(/FROM node:20-alpine AS builder/i);
    expect(content).toMatch(/npm run build/i);
    expect(content).toMatch(/FROM nginx:1\.27-alpine AS runner/i);
    expect(content).toMatch(/COPY --from=builder \/app\/dist \/usr\/share\/nginx\/html/i);
    expect(content).toMatch(/EXPOSE 80 443/i);
    expect(content).toMatch(/HEALTHCHECK/i);
    expect(content).toMatch(/CMD \["nginx", "-g", "daemon off;"\]/i);
  });

  it('2. Backend Dockerfile: implements production Alpine container with tini and non-root user', () => {
    const backendDockerfilePath = path.join(rootDir, 'server/Dockerfile');
    expect(fs.existsSync(backendDockerfilePath)).toBe(true);

    const content = fs.readFileSync(backendDockerfilePath, 'utf-8');
    expect(content).toMatch(/FROM node:20-alpine/i);
    expect(content).toMatch(/tini/i);
    expect(content).toMatch(/USER node/i);
    expect(content).toMatch(/ENV NODE_ENV=production/i);
    expect(content).toMatch(/EXPOSE 4000/i);
    expect(content).toMatch(/HEALTHCHECK/i);
    expect(content).toMatch(/\/api\/healthcheck/i);
    expect(content).toMatch(/ENTRYPOINT \["\/sbin\/tini", "--"\]/i);
  });

  it('3. Production docker-compose.yml: orchestrates frontend, backend, mongodb, and redis with healthchecks', () => {
    const composePath = path.join(rootDir, 'docker-compose.yml');
    expect(fs.existsSync(composePath)).toBe(true);

    const content = fs.readFileSync(composePath, 'utf-8');
    expect(content).toMatch(/mongodb:/i);
    expect(content).toMatch(/backend:/i);
    expect(content).toMatch(/frontend:/i);
    expect(content).toMatch(/redis:/i);

    // Healthcheck dependencies
    expect(content).toMatch(/condition:\s*service_healthy/i);

    // Persistent storage volumes
    expect(content).toMatch(/mongodb_data:/i);
    expect(content).toMatch(/redis_data:/i);

    // Network isolation
    expect(content).toMatch(/healthsphere-network:/i);
  });

  it('4. Development docker-compose.dev.yml: configures volume hot-reloading and port mappings', () => {
    const devComposePath = path.join(rootDir, 'docker-compose.dev.yml');
    expect(fs.existsSync(devComposePath)).toBe(true);

    const content = fs.readFileSync(devComposePath, 'utf-8');
    expect(content).toMatch(/27017:27017/i);
    expect(content).toMatch(/4000:4000/i);
    expect(content).toMatch(/5173:5173/i);
    expect(content).toMatch(/\.\/server:\/app/i);
  });

  it('5. Nginx reverse proxy configuration: correctly proxies API, WebSockets, and SPA routes', () => {
    const nginxConfPath = path.join(rootDir, 'nginx/nginx.conf');
    const defaultConfPath = path.join(rootDir, 'nginx/conf.d/default.conf');

    expect(fs.existsSync(nginxConfPath)).toBe(true);
    expect(fs.existsSync(defaultConfPath)).toBe(true);

    const nginxConf = fs.readFileSync(nginxConfPath, 'utf-8');
    expect(nginxConf).toMatch(/gzip on;/i);
    expect(nginxConf).toMatch(/server_tokens off;/i);

    const defaultConf = fs.readFileSync(defaultConfPath, 'utf-8');
    expect(defaultConf).toMatch(/upstream backend_upstream/i);
    expect(defaultConf).toMatch(/location \/api\//i);
    expect(defaultConf).toMatch(/location \/socket\.io\//i);
    expect(defaultConf).toMatch(/Upgrade \$http_upgrade/i);
    expect(defaultConf).toMatch(/try_files \$uri \$uri\/ \/index\.html/i);
    expect(defaultConf).toMatch(/X-Frame-Options/i);
    expect(defaultConf).toMatch(/X-Content-Type-Options/i);
  });

  it('6. Environment template: provides complete production variable matrix', () => {
    const envDockerPath = path.join(rootDir, '.env.docker.example');
    expect(fs.existsSync(envDockerPath)).toBe(true);

    const content = fs.readFileSync(envDockerPath, 'utf-8');
    expect(content).toMatch(/NODE_ENV=production/i);
    expect(content).toMatch(/MONGODB_URI=/i);
    expect(content).toMatch(/JWT_SECRET=/i);
    expect(content).toMatch(/REDIS_URL=/i);
    expect(content).toMatch(/VITE_API_URL=/i);
  });
});
