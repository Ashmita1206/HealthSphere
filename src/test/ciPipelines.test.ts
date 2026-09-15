import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('F36 — CI/CD Automation Pipeline Suite', () => {
  const workflowsDir = path.resolve(__dirname, '../../.github/workflows');

  it('1. Workflow directory structure: all required GitHub Actions workflows exist', () => {
    expect(fs.existsSync(workflowsDir)).toBe(true);
    expect(fs.existsSync(path.join(workflowsDir, 'ci.yml'))).toBe(true);
    expect(fs.existsSync(path.join(workflowsDir, 'security.yml'))).toBe(true);
    expect(fs.existsSync(path.join(workflowsDir, 'deploy.yml'))).toBe(true);
  });

  it('2. CI workflow: includes linting, typechecking, tests, build, and artifact upload', () => {
    const ciContent = fs.readFileSync(path.join(workflowsDir, 'ci.yml'), 'utf-8');

    // Trigger specifications
    expect(ciContent).toMatch(/push:/i);
    expect(ciContent).toMatch(/pull_request:/i);
    expect(ciContent).toMatch(/main/i);

    // Concurrency control to avoid wasted runners
    expect(ciContent).toMatch(/concurrency:/i);
    expect(ciContent).toMatch(/cancel-in-progress:\s*true/i);

    // Job 1: Lint & Typecheck
    expect(ciContent).toMatch(/lint-and-typecheck:/i);
    expect(ciContent).toMatch(/npm run lint/i);
    expect(ciContent).toMatch(/npx tsc --noEmit/i);

    // Job 2: Test
    expect(ciContent).toMatch(/test:/i);
    expect(ciContent).toMatch(/npm test/i);

    // Job 3: Build & Artifact Upload
    expect(ciContent).toMatch(/build:/i);
    expect(ciContent).toMatch(/npm run build/i);
    expect(ciContent).toMatch(/actions\/upload-artifact@v4/i);
    expect(ciContent).toMatch(/path:\s*dist\//i);
  });

  it('3. Security workflow: configures scheduled audit and dependency monitoring', () => {
    const secContent = fs.readFileSync(path.join(workflowsDir, 'security.yml'), 'utf-8');

    expect(secContent).toMatch(/schedule:/i);
    expect(secContent).toMatch(/cron:/i);
    expect(secContent).toMatch(/npm audit/i);
  });

  it('4. Deploy workflow: prepares tagged production releases and compose verification', () => {
    const deployContent = fs.readFileSync(path.join(workflowsDir, 'deploy.yml'), 'utf-8');

    expect(deployContent).toMatch(/tags:/i);
    expect(deployContent).toMatch(/workflow_dispatch:/i);
    expect(deployContent).toMatch(/npm run build/i);
    expect(deployContent).toMatch(/actions\/upload-artifact@v4/i);
  });

  it('5. Branch protection readiness: critical jobs exist with canonical job identifiers', () => {
    const ciContent = fs.readFileSync(path.join(workflowsDir, 'ci.yml'), 'utf-8');

    // Canonical job IDs suitable for GitHub repository branch protection rules
    expect(ciContent).toContain('lint-and-typecheck:');
    expect(ciContent).toContain('test:');
    expect(ciContent).toContain('build:');
  });

  it('6. Rollback workflow: supports manual trigger with target version and connection draining', () => {
    const rollbackPath = path.join(workflowsDir, 'rollback.yml');
    expect(fs.existsSync(rollbackPath)).toBe(true);

    const rollbackContent = fs.readFileSync(rollbackPath, 'utf-8');
    expect(rollbackContent).toMatch(/workflow_dispatch:/i);
    expect(rollbackContent).toMatch(/target_release/i);
    expect(rollbackContent).toMatch(/incident_ticket/i);
    expect(rollbackContent).toMatch(/drain_connections/i);
    expect(rollbackContent).toMatch(/npm run build/i);
  });

  it('7. Branch protection documentation: defines mandatory quality gates and status checks', () => {
    const branchDocPath = path.resolve(__dirname, '../../.github/BRANCH_PROTECTION.md');
    expect(fs.existsSync(branchDocPath)).toBe(true);

    const branchDoc = fs.readFileSync(branchDocPath, 'utf-8');
    expect(branchDoc).toMatch(/Protected Branches/i);
    expect(branchDoc).toMatch(/Required approvals/i);
    expect(branchDoc).toMatch(/Status Checks/i);
    expect(branchDoc).toMatch(/Emergency Bypass Protocol/i);
  });
});

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
