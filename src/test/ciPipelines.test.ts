import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('F41 — CI/CD Pipeline Automation', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const workflowsDir = path.join(rootDir, '.github/workflows');

  describe('Primary CI Workflow (.github/workflows/ci.yml)', () => {
    it('defines all required quality, testing, build, docker, and deployment gates', () => {
      const ciPath = path.join(workflowsDir, 'ci.yml');
      expect(fs.existsSync(ciPath)).toBe(true);

      const content = fs.readFileSync(ciPath, 'utf-8');

      // Required stages
      expect(content).toContain('quality_checks:');
      expect(content).toContain('automated_testing:');
      expect(content).toContain('production_build:');
      expect(content).toContain('docker_validation:');
      expect(content).toContain('deployment_ready:');

      // Commands & tools
      expect(content).toContain('npx tsc --noEmit');
      expect(content).toContain('npm run lint');
      expect(content).toContain('npm test');
      expect(content).toContain('npm run build');
      expect(content).toContain('Dockerfile.backend');
      expect(content).toContain('Dockerfile');
    });
  });

  describe('Security Scanning Workflow (.github/workflows/security.yml)', () => {
    it('configures dependency vulnerability audits and secret detection', () => {
      const secPath = path.join(workflowsDir, 'security.yml');
      expect(fs.existsSync(secPath)).toBe(true);

      const content = fs.readFileSync(secPath, 'utf-8');
      expect(content).toContain('dependency_security:');
      expect(content).toContain('npm audit');
      expect(content).toContain('code_security_scan:');
    });
  });

  describe('Deployment Pipeline (.github/workflows/deploy.yml)', () => {
    it('configures environment-gated production and staging deployments', () => {
      const deployPath = path.join(workflowsDir, 'deploy.yml');
      expect(fs.existsSync(deployPath)).toBe(true);

      const content = fs.readFileSync(deployPath, 'utf-8');
      expect(content).toContain('staging');
      expect(content).toContain('production');
      expect(content).toContain('deploy:');
    });
  });
});
