/**
 * HealthSphere Enterprise Feature Flag Engine
 */
class FeatureFlagManager {
  constructor() {
    this.flags = {
      AI_CONSULTATION_ASSISTANT: {
        description: 'AI Clinical Copilot & SOAP Note Generator',
        enabled: true,
        rolloutPercentage: 100,
      },
      REALTIME_COLLABORATION: {
        description: 'Socket.IO Hospital Workspace & Live Charting',
        enabled: true,
        rolloutPercentage: 100,
      },
      OFFLINE_BACKGROUND_SYNC: {
        description: 'Service Worker & IndexedDB Sync',
        enabled: true,
        rolloutPercentage: 100,
      },
      WEARABLES_LIVE_TELEMETRY: {
        description: 'Continuous Apple Watch / Fitbit BLE sync',
        enabled: true,
        rolloutPercentage: 100,
      },
      ADVANCED_SECURITY_2FA: {
        description: 'TOTP Two-Factor Authentication & Device Sessions',
        enabled: true,
        rolloutPercentage: 100,
      },
      POPULATION_ANALYTICS: {
        description: 'Epidemiological Heatmaps & Predictive Models',
        enabled: true,
        rolloutPercentage: 100,
      },
      EXPERIMENTAL_HL7_FHIR: {
        description: 'Interoperability export to Epic/Cerner FHIR R4',
        enabled: false,
        rolloutPercentage: 0,
      },
    };

    this.overrides = new Map();
  }

  isEnabled(flagKey, context = {}) {
    if (this.overrides.has(flagKey)) {
      return this.overrides.get(flagKey);
    }

    const flag = this.flags[flagKey];
    if (!flag) return false;
    if (!flag.enabled) return false;

    // Optional user percentage rollout evaluation
    if (flag.rolloutPercentage < 100 && context.userId) {
      const hash = String(context.userId).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return hash % 100 < flag.rolloutPercentage;
    }

    return flag.enabled;
  }

  setOverride(flagKey, value) {
    this.overrides.set(flagKey, Boolean(value));
  }

  clearOverrides() {
    this.overrides.clear();
  }

  getAllFlags() {
    const result = {};
    for (const [key, val] of Object.entries(this.flags)) {
      result[key] = {
        enabled: this.isEnabled(key),
        description: val.description,
      };
    }
    return result;
  }
}

const featureFlags = new FeatureFlagManager();

module.exports = {
  featureFlags,
  FeatureFlagManager,
};
