import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('F40 — Production Deployment & Release Readiness Suite', () => {
  const rootDir = path.resolve(__dirname, '../..');

  // ----------------------------------------------------
  // 1. Environment Validator
  // ----------------------------------------------------
  describe('1. Environment Validator', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { validateEnvironment } = require('../../server/config/envValidator');

    it('rejects invalid database URI protocols', () => {
      const result = validateEnvironment({
        PORT: '4000',
        MONGODB_URI: 'mysql://localhost:3306/db',
        JWT_SECRET: 'a-very-long-production-ready-jwt-secret-key-2026',
        NODE_ENV: 'production',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e: string) => e.includes('MONGODB_URI'))).toBe(true);
    });

    it('rejects insecure default secrets in production', () => {
      const result = validateEnvironment({
        PORT: '4000',
        MONGODB_URI: 'mongodb://mongodb:27017/healthsphere',
        JWT_SECRET: 'dev-secret-key-12345',
        NODE_ENV: 'production',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e: string) => e.includes('known insecure'))).toBe(true);
    });

    it('approves robust production environment configuration', () => {
      const result = validateEnvironment({
        PORT: '4000',
        MONGODB_URI: 'mongodb+srv://admin:securepass@cluster.mongodb.net/healthsphere',
        JWT_SECRET: '9f8e7d6c5b4a3928170e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c',
        NODE_ENV: 'production',
        CLIENT_URL: 'https://healthsphere.org',
      });

      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
      expect(result.summary.databaseConfigured).toBe(true);
    });
  });

  // ----------------------------------------------------
  // 2. Vercel Configuration
  // ----------------------------------------------------
  describe('2. Vercel Edge Configuration', () => {
    it('configures SPA fallback and security response headers', () => {
      const vercelPath = path.join(rootDir, 'vercel.json');
      expect(fs.existsSync(vercelPath)).toBe(true);

      const config = JSON.parse(fs.readFileSync(vercelPath, 'utf-8'));
      expect(config.rewrites).toBeDefined();
      expect(config.rewrites[0].destination).toBe('/index.html');
      expect(config.headers).toBeDefined();

      const globalHeaders = config.headers.find((h: { source: string }) => h.source === '/(.*)');
      expect(globalHeaders).toBeDefined();
      const headerNames = globalHeaders.headers.map((item: { key: string }) => item.key);
      expect(headerNames).toContain('X-Content-Type-Options');
      expect(headerNames).toContain('X-Frame-Options');
      expect(headerNames).toContain('Strict-Transport-Security');
    });
  });

  // ----------------------------------------------------
  // 3. Process Management & Cloud Blueprints
  // ----------------------------------------------------
  describe('3. Cloud Blueprints & Process Manager', () => {
    it('ecosystem.config.cjs configures cluster mode and memory threshold', () => {
      const pm2Path = path.join(rootDir, 'ecosystem.config.cjs');
      expect(fs.existsSync(pm2Path)).toBe(true);

      const content = fs.readFileSync(pm2Path, 'utf-8');
      expect(content).toMatch(/exec_mode:\s*['"]cluster['"]/);
      expect(content).toMatch(/max_memory_restart:\s*['"]1G['"]/);
      expect(content).toMatch(/kill_timeout:\s*10000/);
    });

    it('render.yaml specifies production service blueprint and health path', () => {
      const renderPath = path.join(rootDir, 'render.yaml');
      expect(fs.existsSync(renderPath)).toBe(true);

      const content = fs.readFileSync(renderPath, 'utf-8');
      expect(content).toMatch(/healthCheckPath:\s*\/api\/system\/ready/);
      expect(content).toMatch(/NODE_ENV/);
    });
  });

  // ----------------------------------------------------
  // 4. Production Scripts & Documentation
  // ----------------------------------------------------
  describe('4. Operational Scripts & Documentation', () => {
    it('backup and restore scripts exist with proper shebang', () => {
      const backupPath = path.join(rootDir, 'scripts/backup-db.sh');
      const restorePath = path.join(rootDir, 'scripts/restore-db.sh');
      const healthPath = path.join(rootDir, 'scripts/healthcheck.sh');

      expect(fs.existsSync(backupPath)).toBe(true);
      expect(fs.existsSync(restorePath)).toBe(true);
      expect(fs.existsSync(healthPath)).toBe(true);

      expect(fs.readFileSync(backupPath, 'utf-8')).toMatch(/^#!\/usr\/bin\/env bash/);
      expect(fs.readFileSync(restorePath, 'utf-8')).toMatch(/^#!\/usr\/bin\/env bash/);
      expect(fs.readFileSync(healthPath, 'utf-8')).toMatch(/^#!\/usr\/bin\/env bash/);
    });

    it('deployment guide covers architecture, Atlas, and backup policies', () => {
      const guidePath = path.join(rootDir, 'docs/DEPLOYMENT_GUIDE.md');
      expect(fs.existsSync(guidePath)).toBe(true);

      const content = fs.readFileSync(guidePath, 'utf-8');
      expect(content).toMatch(/System Architecture/i);
      expect(content).toMatch(/Docker Compose Production Deployment/i);
      expect(content).toMatch(/MongoDB Atlas Configuration/i);
      expect(content).toMatch(/Backup & Disaster Recovery Strategy/i);
      expect(content).toMatch(/Checklist/i);
    });
  });
});
