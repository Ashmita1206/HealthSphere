import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

const { validateEnvironment, ENVIRONMENT_PROFILES } = require('../../server/config/envValidator');
const { FeatureFlagManager } = require('../../server/config/featureFlags');

describe('F43 — Production Configuration, Secrets & Backup Engine', () => {
  const originalEnv = { ...process.env };
  const rootDir = path.resolve(__dirname, '../../');

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('Environment & Secrets Validator', () => {
    it('passes development validation with fallback defaults', () => {
      process.env.NODE_ENV = 'development';
      const result = validateEnvironment();

      expect(result.valid).toBe(true);
      expect(result.environment).toBe('development');
      expect(result.errors).toHaveLength(0);
    });

    it('flags missing required variables in production environment', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.MONGODB_URI;
      delete process.env.JWT_SECRET;
      delete process.env.CLIENT_URL;

      expect(() => validateEnvironment()).toThrow(/Production environment validation failed/);
    });

    it('enforces strong 32+ character secrets in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.MONGODB_URI = 'mongodb://localhost:27017/prod';
      process.env.CLIENT_URL = 'https://healthsphere.org';
      process.env.JWT_SECRET = 'short_insecure_secret';

      expect(() => validateEnvironment()).toThrow(/Security Violation: JWT_SECRET must be at least 32 characters/);
    });
  });

  describe('Feature Flag Engine', () => {
    let flagManager: any;

    beforeEach(() => {
      flagManager = new FeatureFlagManager();
    });

    it('returns default enabled states for core clinical modules', () => {
      expect(flagManager.isEnabled('AI_CONSULTATION_ASSISTANT')).toBe(true);
      expect(flagManager.isEnabled('REALTIME_COLLABORATION')).toBe(true);
      expect(flagManager.isEnabled('WEARABLES_LIVE_TELEMETRY')).toBe(true);
      expect(flagManager.isEnabled('EXPERIMENTAL_HL7_FHIR')).toBe(false);
    });

    it('allows dynamic overrides for blue-green feature toggling', () => {
      flagManager.setOverride('EXPERIMENTAL_HL7_FHIR', true);
      expect(flagManager.isEnabled('EXPERIMENTAL_HL7_FHIR')).toBe(true);

      flagManager.setOverride('EXPERIMENTAL_HL7_FHIR', false);
      expect(flagManager.isEnabled('EXPERIMENTAL_HL7_FHIR')).toBe(false);

      flagManager.clearOverrides();
      expect(flagManager.isEnabled('EXPERIMENTAL_HL7_FHIR')).toBe(false);
    });

    it('exports all feature flags dictionary', () => {
      const all = flagManager.getAllFlags();
      expect(all.AI_CONSULTATION_ASSISTANT).toBeDefined();
      expect(all.AI_CONSULTATION_ASSISTANT.enabled).toBe(true);
      expect(all.AI_CONSULTATION_ASSISTANT.description).toContain('AI Clinical Copilot');
    });
  });

  describe('Disaster Recovery & Backup Shell Automation', () => {
    it('verifies existence and structure of backup-db.sh', () => {
      const scriptPath = path.join(rootDir, 'scripts/backup-db.sh');
      expect(fs.existsSync(scriptPath)).toBe(true);

      const content = fs.readFileSync(scriptPath, 'utf-8');
      expect(content).toContain('mongodump');
      expect(content).toContain('tar -czf');
      expect(content).toContain('RETENTION_DAYS');
    });

    it('verifies existence and structure of restore-db.sh', () => {
      const scriptPath = path.join(rootDir, 'scripts/restore-db.sh');
      expect(fs.existsSync(scriptPath)).toBe(true);

      const content = fs.readFileSync(scriptPath, 'utf-8');
      expect(content).toContain('mongorestore');
      expect(content).toContain('--gzip');
    });

    it('verifies existence and structure of healthcheck.sh probe', () => {
      const scriptPath = path.join(rootDir, 'scripts/healthcheck.sh');
      expect(fs.existsSync(scriptPath)).toBe(true);

      const content = fs.readFileSync(scriptPath, 'utf-8');
      expect(content).toContain('/health/readiness');
      expect(content).toContain('curl');
    });
  });
});
